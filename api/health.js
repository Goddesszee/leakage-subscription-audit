module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.status(200).json({ status: 'ok' });
};
