/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *       (if additional are added, keep them at the very end!)
 */

const chaiHttp = require("chai-http")
const chai = require("chai")
const assert = chai.assert
const server = require("../server")
const mongoose = require("mongoose")
const Issue = require("./../models/issue")

chai.use(chaiHttp)
require("dotenv").config()

const { MONGO_PASSWORD, MONGO_USER } = process.env
mongoose.connect(
  `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@ds137008.mlab.com:37008/stock-checker`,
  { useNewUrlParser: true }
)
const project = "test"
const issue = {
  issue_title: "Title",
  issue_text: "text",
  created_by: "Functional Test - Every field filled in",
  assigned_to: "Chai and Mocha",
  status_text: "In QA"
}
suite("Functional Tests", function() {
  before(function(done) {
    Issue.remove({ project }).then(() => done())
  })

  suite(
    "GET /api/issues/{project} => Array of objects with no issue data",
    function() {
      test("No filter", function(done) {
        chai
          .request(server)
          .get("/api/issues/test")
          .query({})
          .end(function(err, res) {
            assert.equal(res.status, 201)
            assert.isArray(res.body)
            assert.equal(res.body.length, 0)
            done()
          })
      })
    }
  )

  suite("POST /api/issues/{project} => object with issue data", function() {
    test("Every field filled in", function(done) {
      chai
        .request(server)
        .post("/api/issues/test")
        .send(issue)
        .end(function(err, res) {
          const resToArrKeys = Object.keys(res.body)
          const issueToArrKeys = Object.keys(issue)
          assert.equal(res.status, 201)
          assert.isObject(res.body)
          assert.isTrue(issueToArrKeys.every((a, i) => a === resToArrKeys[i]))
          done()
        })
    })

    test("Required fields filled in", function(done) {
      chai
        .request(server)
        .post("/api/issues/test")
        .send(issue)
        .end(function(err, res) {
          assert.equal(res.status, 201)
          assert.property(res.body, "issue_title")
          assert.property(res.body, "issue_text")
          assert.property(res.body, "created_by")
          done()
        })
    })

    test("Missing required fields", function(done) {
      chai
        .request(server)
        .post("/api/issues/test")
        .send({ ...issue, issue_title: undefined })
        .end(function(err, res) {
          assert.equal(res.status, 400)
          done()
        })
    })
  })

  suite("PUT /api/issues/{project} => text", function() {
    test("No body", function(done) {
      Issue.remove({ project }).then(() => {
        chai
          .request(server)
          .post("/api/issues/test")
          .send(issue)
          .end(function(err, res) {
            const { _id } = res.body
            chai
              .request(server)
              .put("/api/issues/test")
              .send({ _id })
              .end(function(err, res) {
                assert.equal(res.body, "no updated field sent")
                done()
              })
          })
      })
    })

    test("One field to update", function(done) {
      Issue.remove({ project }).then(() => {
        chai
          .request(server)
          .post("/api/issues/test")
          .send(issue)
          .end(function(err, res) {
            const { _id } = res.body
            chai
              .request(server)
              .put("/api/issues/test")
              .send({ _id, issue_text: "New text" })
              .end(function(err, res) {
                assert.equal(res.body, "successfully updated")
                done()
              })
          })
      })
    })

    test("Multiple fields to update", function(done) {
      Issue.remove({ project }).then(() => {
        chai
          .request(server)
          .post("/api/issues/test")
          .send(issue)
          .end(function(err, res) {
            const { _id } = res.body
            chai
              .request(server)
              .put("/api/issues/test")
              .send({
                _id,
                issue_text: "New text",
                created_by: "Pierre-Alexis Blond"
              })
              .end(function(err, res) {
                assert.equal(res.body, "successfully updated")
                done()
              })
          })
      })
    })
  })

  suite(
    "GET /api/issues/{project} => Array of objects with issue data",
    function() {
      test("No filter", function(done) {
        chai
          .request(server)
          .get("/api/issues/test")
          .query({})
          .end(function(err, res) {
            assert.equal(res.status, 201)
            assert.isArray(res.body)
            assert.property(res.body[0], "issue_title")
            assert.property(res.body[0], "issue_text")
            assert.property(res.body[0], "created_on")
            assert.property(res.body[0], "updated_on")
            assert.property(res.body[0], "created_by")
            assert.property(res.body[0], "assigned_to")
            assert.property(res.body[0], "open")
            assert.property(res.body[0], "status_text")
            assert.property(res.body[0], "_id")
            done()
          })
      })

      test("One filter", function(done) {
        chai
          .request(server)
          .get("/api/issues/test")
          .query({ open: true })
          .end(function(err, res) {
            assert.equal(res.status, 201)
            assert.isArray(res.body)
            assert.property(res.body[0], "issue_title")
            assert.property(res.body[0], "issue_text")
            assert.property(res.body[0], "created_on")
            assert.property(res.body[0], "updated_on")
            assert.property(res.body[0], "created_by")
            assert.property(res.body[0], "assigned_to")
            assert.property(res.body[0], "open")
            assert.property(res.body[0], "status_text")
            assert.property(res.body[0], "_id")
            done()
          })
      })

      test("Multiple filters (test for multiple fields you know will be in the db for a return)", function(done) {
        chai
          .request(server)
          .get("/api/issues/test")
          .query({
            open: true,
            issue_text: "New text",
            created_by: "Pierre-Alexis Blond"
          })
          .end(function(err, res) {
            assert.equal(res.status, 201)
            assert.isArray(res.body)
            assert.property(res.body[0], "issue_title")
            assert.property(res.body[0], "issue_text")
            assert.property(res.body[0], "created_on")
            assert.property(res.body[0], "updated_on")
            assert.property(res.body[0], "created_by")
            assert.property(res.body[0], "assigned_to")
            assert.property(res.body[0], "open")
            assert.property(res.body[0], "status_text")
            assert.property(res.body[0], "_id")
            done()
          })
      })
    }
  )

  suite("DELETE /api/issues/{project} => text", function() {
    test("No _id", function(done) {
      chai
        .request(server)
        .delete("/api/issues/test")
        .send({ _id: undefined })
        .end(function(err, res) {
          assert.equal(res.status, 201)
          assert.equal(res.body, "_id error")
          done()
        })
    })

    test("Valid _id", function(done) {
      chai
        .request(server)
        .get("/api/issues/test")
        .query({
          open: true,
          issue_text: "New text",
          created_by: "Pierre-Alexis Blond"
        })
        .end(function(err, res) {
          const { _id } = res.body[0]
          chai
            .request(server)
            .delete("/api/issues/test")
            .send({ _id })
            .end(function(err, res) {
              assert.equal(res.status, 201)
              assert.equal(res.body, `deleted ${_id}`)
              done()
            })
        })
    })
  })
})
