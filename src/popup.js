document.addEventListener('DOMContentLoaded', function() {
    const downloadList = document.getElementById('download-list');

    chrome.downloads.search({}, function(items) {
        if (items.length === 0) {
            downloadList.innerHTML = '<p>No recent downloads.</p>';
        } else {
            items.forEach(item => {
                const downloadItem = document.createElement('div');
                downloadItem.className = 'download-item';
                downloadItem.innerHTML = `
          <strong>${item.filename}</strong><br>
          URL: <a href="${item.url}" target="_blank">${item.url}</a><br>
          File size: ${item.fileSize} bytes<br>
          State: ${item.state}
        `;
                downloadList.appendChild(downloadItem);
            });
        }
    });
});

// connecting to ftp server and getting data from it
document.getElementById('connect-btn').addEventListener('click', function () {
    const server = document.getElementById('ftp-server').value;
    const username = document.getElementById('ftp-username').value;
    const password = document.getElementById('ftp-password').value;

    const ftp = new JSFTP({
        host: server.replace('ftp://', ''),
        user: username,
        pass: password
    });

    // List files on FTP server
    ftp.ls('.', (err, res) => {
        if (err) {
            console.error('Error listing files', err);
            return;
        }

        const fileList = document.getElementById('file-list');
        fileList.innerHTML = '<ul>' + res.map(file => `<li>${file.name}</li>`).join('') + '</ul>';
    });

    // Example for downloading a file
    ftp.get('/path/to/file.txt', (err, socket) => {
        if (err) {
            console.error('Error downloading file', err);
            return;
        }

        const chunks = [];
        socket.on('data', (chunk) => {
            chunks.push(chunk);
            updateProgress(chunks.length);
        });

        socket.on('close', (err) => {
            if (err) console.error('Error closing socket', err);

            const blob = new Blob(chunks, {type: 'text/plain'});
            const url = URL.createObjectURL(blob);

            chrome.downloads.download({
                url: url,
                filename: 'downloaded-file.txt'
            });
        });

        socket.resume();
    });

    // Progress bar update function
    function updateProgress(progress) {
        const progressBar = document.getElementById('progress-bar');
        const progressText = document.getElementById('progress-text');
        progressBar.value = progress;
        progressText.innerText = `Progress: ${progress}%`;
    }
});

