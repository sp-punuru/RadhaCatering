<?php
// api/upload.php - Image upload handler for Radha Catering
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed. Use POST.']);
    exit;
}

$uploadDir = __DIR__ . '/../uploads/';

if (!is_dir($uploadDir)) {
    @mkdir($uploadDir, 0755, true);
}

if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    $errorMsg = 'No file uploaded or upload error occurred.';
    if (isset($_FILES['image'])) {
        switch ($_FILES['image']['error']) {
            case UPLOAD_ERR_INI_SIZE:
            case UPLOAD_ERR_FORM_SIZE:
                $errorMsg = 'File exceeds maximum upload size (5MB).';
                break;
            case UPLOAD_ERR_PARTIAL:
                $errorMsg = 'File was only partially uploaded.';
                break;
            case UPLOAD_ERR_NO_FILE:
                $errorMsg = 'No file was submitted.';
                break;
            case UPLOAD_ERR_NO_TMP_DIR:
                $errorMsg = 'Missing temporary folder on server.';
                break;
            case UPLOAD_ERR_CANT_WRITE:
                $errorMsg = 'Failed to write file to disk.';
                break;
        }
    }
    http_response_code(400);
    echo json_encode(['error' => $errorMsg]);
    exit;
}

$file = $_FILES['image'];
$maxSize = 8 * 1024 * 1024; // 8MB

if ($file['size'] > $maxSize) {
    http_response_code(400);
    echo json_encode(['error' => 'Image file is too large. Maximum size is 8MB.']);
    exit;
}

$allowedMimes = [
    'image/jpeg' => 'jpg',
    'image/jpg'  => 'jpg',
    'image/png'  => 'png',
    'image/webp' => 'webp',
    'image/gif'  => 'gif'
];

$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!isset($allowedMimes[$mimeType])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid file format. Allowed formats: JPG, PNG, WEBP, GIF.']);
    exit;
}

$extension = $allowedMimes[$mimeType];
$safeName = 'dish_' . time() . '_' . substr(md5(uniqid(rand(), true)), 0, 8) . '.' . $extension;
$destination = $uploadDir . $safeName;

if (move_uploaded_file($file['tmp_name'], $destination)) {
    @chmod($destination, 0644);
    echo json_encode([
        'success' => true,
        'url' => 'uploads/' . $safeName,
        'filename' => $safeName,
        'size' => $file['size']
    ]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save uploaded file. Check uploads/ directory permissions on Hostinger.']);
}
