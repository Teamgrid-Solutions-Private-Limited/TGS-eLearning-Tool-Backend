const XapiStatement = require('../models/XapiStatement');

exports.createXapiStatement = async (req, res) => {
  try {
    const statement = new XapiStatement(req.body);
    await statement.save();
    res.status(201).json(statement);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getStatementsByOrg = async (req, res) => {
  try {
    const statements = await XapiStatement.find({ organizationId: req.params.orgId });
    res.json(statements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
