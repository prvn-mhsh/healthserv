const { logger } = require('@emedihub/observability-backend');
const { getPaginationParams, formatPaginatedResponse } = require('../utils/pagination');
const repo = require('../repositories/article.repo');
const db = require('../db/mysql');

/**
 * GET PUBLISHED ARTICLES (PAGINATED)
 * Query params: page, perPage
 */
exports.getPublishedArticles = async (req, res) => {
  try {
    const { page, limit, offset } = getPaginationParams(req.query, 10);

    const total = await repo.countPublishedArticles();
    const [rows] = await repo.getPublishedArticlesWithPagination(limit, offset);

    // Front page: show title and main picture (and id for linking)
    const articles = rows.map(r => ({
      id: r.id,
      title: r.title,
      mainImage: r.main_image || null,
      summary: r.summary || null
    }));

    res.json(formatPaginatedResponse(articles, total, page, limit));
  } catch (err) {
    logger.error({ path: req.originalUrl }, 'Failed to fetch published articles', err);
    res.status(500).json({ message: 'Failed to fetch published articles' });
  }
};

/**
 * GET ARTICLE DETAILS (includes images, content, comments)
 */
exports.getArticleDetails = async (req, res) => {
  try {
    const id = req.params.id;
    const article = await repo.getArticleById(id);
    if (!article || article.status !== 'PUBLISHED') {
      return res.status(404).json({ message: 'Article not found' });
    }

    // parse JSON fields
    try {
      article.tags = JSON.parse(article.tags || '[]');
    } catch (e) {
      article.tags = [];
    }

    try {
      article.images = JSON.parse(article.images || '[]');
    } catch (e) {
      article.images = [];
    }

    const comments = await repo.getCommentsByArticle(id);

    res.json({
      id: article.id,
      title: article.title,
      mainImage: article.main_image || null,
      images: article.images,
      content: article.content,
      authorName: article.author_name,
      publishedAt: article.published_at,
      comments
    });
  } catch (err) {
    logger.error({ path: req.originalUrl }, 'Failed to fetch article details', err);
    res.status(500).json({ message: 'Failed to fetch article details' });
  }
};

/**
 * REPORT ARTICLE ABUSE
 */
exports.reportArticle = async (req, res) => {
  try {
    await db.execute(
      `INSERT INTO article_reports (article_id, reported_by, notes)
       VALUES (?, ?, ?)`,
      [req.params.id, req.body.userId, req.body.notes]
    );

    res.status(201).json({ message: 'Reported' });
  } catch (err) {
    logger.error({ path: req.originalUrl }, 'Failed to report article', err);
    res.status(500).json({ message: 'Failed to report article' });
  }
};

/**
 * SEARCH PUBLISHED ARTICLES (FILTERS + PAGINATION)
 * Filters: title (partial), publisherName (partial), startDate, endDate
 */
exports.searchPublishedArticles = async (req, res) => {
  try {
    const { page, limit, offset } = getPaginationParams(req.query, 10);

    const filters = {};
    if (req.query.title) filters.title = req.query.title;
    if (req.query.publisherName) filters.publisherName = req.query.publisherName;

    // Validate dates
    if (req.query.startDate) {
      const d = new Date(req.query.startDate);
      if (!isNaN(d)) filters.startDate = req.query.startDate;
    }
    if (req.query.endDate) {
      const d = new Date(req.query.endDate);
      if (!isNaN(d)) filters.endDate = req.query.endDate;
    }

    const total = await repo.countPublishedArticlesWithFilters(filters);
    const [rows] = await repo.searchPublishedArticles(filters, limit, offset);

    const articles = rows.map(r => ({
      id: r.id,
      title: r.title,
      mainImage: r.main_image || null,
      summary: r.summary || null
    }));

    res.json(formatPaginatedResponse(articles, total, page, limit));
  } catch (err) {
    logger.error({ path: req.originalUrl }, 'Failed to search articles', err);
    res.status(500).json({ message: 'Failed to search articles' });
  }
};
