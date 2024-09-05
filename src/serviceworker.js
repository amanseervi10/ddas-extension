// addListener is available in chrome currently
chrome.downloads.onCreated.addListener(function(downloadItem) {
    // Log the entire downloadItem object
    console.log("DownloadItem object:", downloadItem);

    // // specific properties
    // console.log("Download started:");
    // console.log("Filename:", downloadItem.filename);
    // console.log("URL:", downloadItem.url);
    // console.log("File size (bytes):", downloadItem.fileSize);
    // console.log("ID:", downloadItem.id);
    // console.log("State:", downloadItem.state);
    // console.log("Date Added:", downloadItem.dateAdded);
    // console.log("Start Time:", downloadItem.startTime);
    // console.log("End Time:", downloadItem.endTime);
    // console.log("Mime Type:", downloadItem.mime);

    // Create a notification
    chrome.notifications.create({
        type: 'basic',
        iconUrl: '/assets/icon.png',
        title: 'Download Started',
        message: `Downloading: ${downloadItem.filename}`,
        priority: 2
    }, function(notificationId) {
        if (chrome.runtime.lastError) {
            console.error('Error creating notification:', chrome.runtime.lastError);
        } else {
            console.log('Notification created with ID:', notificationId);
        }
    });

    // if( /* this item entry present in database */ ) {
    // }
    if(downloadItem.fileSize > 500000) {

        console.log("size > 500 mb, cancellign the download");
        cancelDownload(downloadItem.id);
    }
});

chrome.downloads.onChanged.addListener(function(downloadDelta) {
    if (downloadDelta.state && downloadDelta.state.current === 'complete') {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icon.png',
            title: 'Download Completed',
            message: `Completed: ${downloadDelta.filename}`,
            priority: 2
        });
    }
});

function cancelDownload(downloadId) {
    chrome.downloads.cancel(downloadId, function() {
        if (chrome.runtime.lastError) {
            console.error('Error cancelling download:', chrome.runtime.lastError);
        } else {
            console.log('Download cancelled successfully:', downloadId);
        }
    });
}
