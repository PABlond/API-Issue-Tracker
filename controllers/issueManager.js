const Issue = require("../models/issue")

module.exports = class IssueManager {
  async getAllIssues(project, query) {
    return (await Issue.find({ ...query, project }))
      .map(({ _doc }) => _doc)
      .map(project => this.excludeProjectName(project))
  }

  excludeProjectName(projectObj) {
    const { project, ...rest } = projectObj
    return { ...rest }
  }

  async newIssue(project, body) {
    const issue = {
      ...body,
      project,
      created_on: new Date(),
      open: true,
      updated_on: new Date()
    }
    if (!this.checkRequiredProperty(issue)) {
      throw new Error("Missing required field")
    }
    const { _id } = await new Issue(issue).save()
    return this.excludeProjectName({ ...issue, _id })
  }

  checkRequiredProperty(projectObj) {
    const requiredFileds = ["issue_title", "issue_text", "created_by"]
    return requiredFileds.every(
      field => Object.keys(projectObj).indexOf(field) !== -1
    )
  }

  async updateIssue(project, updatedIssue) {
    const { _id } = updatedIssue
    const issue = await Issue.findOne({ _id })
    if (!issue) return `could not update ${_id}`
    else if (Object.keys(updatedIssue).length === 1)
      return "no updated field sent"
    Object.keys({ ...updatedIssue, _id: undefined }).map(key => {
      issue[key] = updatedIssue[key]
    })
    await issue.save()
    return "successfully updated"
  }

  async deleteIssue(project, { _id }) {
    if (!_id) return "_id error"
    const { n } = await Issue.remove({ _id }).catch(err => ({ n: 0 }))
    return n ? `deleted ${_id}` : `could not delete ${_id}`
  }
}
