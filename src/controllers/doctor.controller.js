const { logger } = require('@emedihub/observability-backend');
const { getPaginationParams, formatPaginatedResponse } = require('../utils/pagination');
const repo = require('../repositories/article.repo');
// restored controller (ensures correct handler exports)

/**
 * CREATE ARTICLE (DRAFT)
 */
exports.createArticle = async (req, res) => {
  try {
    const id = await repo.createArticle({
      title: req.body.title,
      summary: req.body.summary,
      content: req.body.content,
      tags: req.body.tags,
      mainImage: req.body.mainImage,
      images: req.body.images,

      authorId: req.user.userId,
      authorName: req.body.authorName || null,
      status: 'DRAFT'
    });

    res.status(201).json({
      articleId: id,
      status: 'DRAFT'
    });
  } catch (err) {
    logger.error({ path: req.originalUrl }, 'Failed to create article', err);
    res.status(500).json({ message: 'Failed to create article' });
  }
};

/**
 * UPDATE ARTICLE (ONLY DRAFT)
 */
exports.updateArticle = async (req, res) => {
  try {
    const affected = await repo.updateArticle(
      req.params.id,
      req.user.userId,
      {
        title: req.body.title,
        summary: req.body.summary,
        content: req.body.content,
        tags: req.body.tags,
        mainImage: req.body.mainImage,
        images: req.body.images
      }
    );

    if (!affected) {
      return res.status(403).json({
        message: 'Cannot update article (not owner or not draft)'
      });
    }

    res.json({ message: 'Draft updated' });
  } catch (err) {
    logger.error({ path: req.originalUrl }, 'Failed to update article', err);
    res.status(500).json({ message: 'Failed to update article' });
  }
};

/**
 * SUBMIT FOR APPROVAL
 */
exports.submitForApproval = async (req, res) => {
  try {
    const affected = await repo.submitForApproval(
      req.params.id,
      req.user.userId
    );

    if (!affected) {
      return res.status(403).json({
        message: 'Cannot submit article (not owner or wrong status)'
      });
    }

    res.json({ message: 'Submitted for approval' });
  } catch (err) {
    logger.error({ path: req.originalUrl }, 'Failed to submit article', err);
    res.status(500).json({ message: 'Failed to submit article' });
  }
};

/**
 * LIST DOCTOR'S ARTICLES (PAGINATED)
 */
exports.getArticles = async (req, res) => {
  try {
    const { page, limit, offset } = getPaginationParams(req.query, 10);
    const authorId = req.user.userId;
    logger.info({ userId: authorId }, 'Fetching articles');

    const total = await repo.countArticlesByAuthor(authorId);
    const articles = await repo.getArticlesByAuthor(authorId, limit, offset);

    res.json(formatPaginatedResponse(articles, total, page, limit));

  } catch (err) {
    logger.error({ path: req.originalUrl }, 'Failed to fetch articles', err);
    res.status(500).json({ message: "Failed to fetch articles" });
  }
};


/**
 * SEARCH DOCTOR'S ARTICLES (FILTERS + PAGINATION)
 * Supported filters: title (partial), status, startDate, endDate
 */
exports.searchArticles = async (req, res) => {
  try {
    const { page, limit, offset } = getPaginationParams(req.query, 10);
    const authorId = req.user.userId;

    const filters = {};
    if (req.query.title) filters.title = req.query.title;
    if (req.query.status) filters.status = req.query.status;

    // Accept ISO date strings (YYYY-MM-DD or full ISO). Validate simply.
    if (req.query.startDate) {
      const d = new Date(req.query.startDate);
      if (!isNaN(d)) filters.startDate = req.query.startDate;
    }
    if (req.query.endDate) {
      const d = new Date(req.query.endDate);
      if (!isNaN(d)) filters.endDate = req.query.endDate;
    }

    const total = await repo.countArticlesByAuthorWithFilters(authorId, filters);
    const [rows] = await repo.getArticlesByAuthorWithFilters(authorId, filters, limit, offset);

    const articles = rows.map(r => {
      try {
        r.tags = JSON.parse(r.tags || '[]');
      } catch (e) {
        r.tags = [];
      }
      return r;
    });

    res.json(formatPaginatedResponse(articles, total, page, limit));
  } catch (err) {
    logger.error({ path: req.originalUrl }, 'Failed to search articles', err);
    res.status(500).json({ message: 'Failed to search articles' });
  }
};
