const repo = require('../repositories/article.repo');

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

      authorId: req.user.userId,
      authorName: null,
      status: 'DRAFT'
    });

    res.status(201).json({
      articleId: id,
      status: 'DRAFT'
    });
  } catch (err) {
    console.error(err);
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
      req.body
    );

    if (!affected) {
      return res.status(403).json({
        message: 'Cannot update article (not owner or not draft)'
      });
    }

    res.json({ message: 'Draft updated' });
  } catch (err) {
    console.error(err);
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
    console.error(err);
    res.status(500).json({ message: 'Failed to submit article' });
  }
};
