const IssueManager = require("./../controllers/issueManager")
const issueManager = new IssueManager()
module.exports = function(app) {
  app
    .route("/api/issues/:project")

    .get(async (req, res) => {
      const { project } = req.params
      return res.status(201).json(await issueManager.getAllIssues(project, req.query))
    })

    .post(async (req, res) => {
      const { project } = req.params
      try {
        return res
          .status(201)
          .json(await issueManager.newIssue(project, req.body))
      } catch (err) {
        return res.status(400).json(err)
      }
    })

    .put(async (req, res) => {
      const { project } = req.params
      return res
        .status(201)
        .json(await issueManager.updateIssue(project, req.body))
    })

    .delete(async (req, res)  => {
      const { project } = req.params
      return res.status(201).json(await issueManager.deleteIssue(project, req.body))
    })
}
