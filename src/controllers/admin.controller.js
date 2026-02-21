const { logger } = require('@emedihub/observability-backend');
const db = require('../db/mysql');
const repo = require('../repositories/article.repo');
const { getPaginationParams, formatPaginatedResponse } = require('../utils/pagination');

/**
 * GET ARTICLES (FILTERED + PAGINATED)
 * Filters: status, doctorName, startDate, endDate
 */
exports.getArticles = async (req, res) => {
  try {
    const { page, limit: perPage, offset } = getPaginationParams(req.query, 10);

    const filters = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.query.doctorName) filters.doctorName = req.query.doctorName;

    if (req.query.startDate) {
      const d = new Date(req.query.startDate);
      if (!isNaN(d)) filters.startDate = req.query.startDate;
    }
    if (req.query.endDate) {
      const d = new Date(req.query.endDate);
      if (!isNaN(d)) filters.endDate = req.query.endDate;
    }

    const total = await repo.countArticlesForAdmin(filters);
    const [rows] = await repo.getArticlesForAdmin(filters, perPage, offset);

    const articles = rows.map(r => {
      try {
        r.tags = JSON.parse(r.tags || '[]');
      } catch (e) {
        r.tags = [];
      }
      return r;
    });

    res.json(formatPaginatedResponse(articles, total, page, perPage));
  } catch (err) {
    logger.error({ path: req.originalUrl }, 'Failed to fetch articles', err);
    res.status(500).json({ message: 'Failed to fetch articles' });
  }
};

/**
 * GET ARTICLE REPORTS
 */
exports.getArticleReports = async (req, res) => {
  try {
    const articleId = req.params.id;
    const reports = await repo.getArticleReports(articleId);
    res.json(reports);
  } catch (err) {
    logger.error({ path: req.originalUrl }, 'Failed to fetch reports', err);
    res.status(500).json({ message: 'Failed to fetch reports' });
  }
};

/**
 * PATCH ARTICLE - Consolidated endpoint for approve, reject, delist, handle reports
 * Body: { action: 'APPROVE'|'REJECT'|'DELIST'|'DISCARD_REPORT'|'POST_REPORT', reason?, reportId? }
 */
exports.patchArticle = async (req, res) => {
  try {
    const articleId = req.params.id;
    const { action, reason, reportId } = req.body;

    if (!action) {
      return res.status(400).json({ message: 'action is required' });
    }

    // Report-related actions
    if (action === 'DISCARD_REPORT') {
      if (!reportId) return res.status(400).json({ message: 'reportId required' });
      await repo.updateArticleReportStatus(reportId, 'DISCARDED', reason);
      return res.json({ message: 'Report discarded' });
    }

    if (action === 'POST_REPORT') {
      if (!reportId) return res.status(400).json({ message: 'reportId required' });
      // Post report as comment to article (send to writer)
      // For now, mark as reviewed and optionally send notification
      await repo.updateArticleReportStatus(reportId, 'REVIEWED', reason);
      return res.json({ message: 'Report posted to article writer' });
    }

    // Article-level actions (APPROVE, REJECT, DELIST)
    if (['APPROVE', 'REJECT', 'DELIST'].includes(action)) {
      await repo.updateArticleStatus(articleId, action, reason);
      return res.json({ message: `Article ${action.toLowerCase()}ed` });
    }

    res.status(400).json({ message: 'Invalid action' });
  } catch (err) {
    logger.error({ path: req.originalUrl }, 'Failed to update article', err);
    res.status(500).json({ message: 'Failed to update article' });
  }
};

/**
 * GET PENDING ARTICLES (legacy)
 */
exports.getPendingArticles = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT * FROM articles WHERE status='PENDING_APPROVAL'`
    );
    res.json(rows);
  } catch (err) {
    logger.error({ path: req.originalUrl }, 'Failed to fetch pending articles', err);
    res.status(500).json({ message: 'Failed to fetch pending articles' });
  }
};

/**
 * APPROVE ARTICLE
 */
exports.approveArticle = async (req, res) => {
  try {
    await db.execute(
      `UPDATE articles
       SET status='PUBLISHED', published_at=NOW()
       WHERE id=? AND status='PENDING_APPROVAL'`,
      [req.params.id]
    );
    res.json({ message: 'Article approved' });
  } catch (err) {
    logger.error({ path: req.originalUrl }, 'Failed to approve article', err);
    res.status(500).json({ message: 'Failed to approve article' });
  }
};

/**
 * REJECT ARTICLE
 */
exports.rejectArticle = async (req, res) => {
  try {
    await db.execute(
      `UPDATE articles
       SET status='REJECTED', rejection_reason=?
       WHERE id=?`,
      [req.body.reason, req.params.id]
    );
    res.json({ message: 'Article rejected' });
  } catch (err) {
    logger.error({ path: req.originalUrl }, 'Failed to reject article', err);
    res.status(500).json({ message: 'Failed to reject article' });
  }
};

/**
 * DELIST ARTICLE
 */
exports.delistArticle = async (req, res) => {
  try {
    await db.execute(
      `UPDATE articles
       SET status='DELISTED', delisted_reason=?
       WHERE id=?`,
      [req.body.reason, req.params.id]
    );
    res.json({ message: 'Article delisted' });
  } catch (err) {
    logger.error({ path: req.originalUrl }, 'Failed to delist article', err);
    res.status(500).json({ message: 'Failed to delist article' });
  }
};
