export default function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    service: 'Avani Loan Services - Production API',
    timestamp: new Date().toISOString()
  });
}
