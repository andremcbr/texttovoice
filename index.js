const express = require('express');
const googleTTS = require('google-tts-api');
const fs = require('fs');
const axios = require('axios');

const app = express();
const port = 3000;

app.get('/convert', async (req, res) => {
  const { text } = req.query;
  const language = 'pt-BR';
  const outputFile = 'output.mp3';

  try {
    const audioUrl = await googleTTS.getAudioUrl(text, {
      lang: language,
      slow: false,
      host: 'https://translate.google.com',
    });

    const audioResponse = await axios.get(audioUrl, {
      responseType: 'arraybuffer',
    });
    const audioBuffer = Buffer.from(audioResponse.data);
    fs.writeFileSync(outputFile, audioBuffer);

    const renamedFile = 'audio.mp3';
    fs.renameSync(outputFile, renamedFile);

    res.download(renamedFile, err => {
      if (err) {
        console.error('Erro ao enviar o arquivo:', err);
        res.status(500).send('Erro ao converter texto em áudio');
      }

      fs.unlinkSync(renamedFile);
    });
  } catch (err) {
    console.error('Erro:', err);
    res.status(500).send('Erro ao converter texto em áudio');
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
