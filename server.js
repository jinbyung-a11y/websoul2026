/**
 * 문의 메일 발송 API (support/inquiry.html에서 사용)
 * 실행: node server.js
 * .env에 SMTP 설정 후 사용 (또는 .env.example 참고)
 */
require('dotenv').config();
var express = require('express');
var cors = require('cors');
var nodemailer = require('nodemailer');

var app = express();
var PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

var transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

var INQUIRY_TO = process.env.INQUIRY_TO || 'support@websoul.co.kr';

app.post('/api/inquiry', function (req, res) {
  var body = req.body || {};
  var company = body.company || '';
  var name = body.name || '';
  var phone = body.phone || '';
  var email = body.email || '';
  var message = body.message || '';

  if (!email.trim()) {
    return res.status(400).json({ error: '이메일 필수' });
  }

  var text = [
    '고객 회사명: ' + company,
    '고객 담당자명: ' + name,
    '고객 연락처: ' + phone,
    '받으실 이메일: ' + email,
    '',
    '문의내용:',
    message
  ].join('\n');

  var mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: INQUIRY_TO,
    subject: '[웹소울랩 문의] ' + (company || '문의'),
    text: text
  };

  transporter.sendMail(mailOptions, function (err, info) {
    if (err) {
      console.error('Inquiry send error:', err);
      return res.status(500).json({ error: '발송 실패' });
    }
    res.json({ ok: true });
  });
});

app.use(express.static(__dirname));

app.listen(PORT, function () {
  console.log('Server running at http://localhost:' + PORT);
  console.log('문의 페이지: http://localhost:' + PORT + '/support/inquiry.html');
});
