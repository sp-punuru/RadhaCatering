<?php
// api/menu.php - Dual-mode API: Works with MySQL if configured, or JSON file by default
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/db_config.php';
$pdo = getDBConnection();
$dataFile = __DIR__ . '/../data/menu.json';

// =========================================================================
// GET: Fetch Menu Data (From MySQL if connected, otherwise data/menu.json)
// =========================================================================
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($pdo) {
        try {
            // 1. Fetch Business Info
            $stmt = $pdo->query("SELECT * FROM `business_info` LIMIT 1");
            $b = $stmt->fetch();
            $businessInfo = [
                "name" => $b['business_name'] ?? "Radha Catering",
                "owner" => $b['owner_name'] ?? "Radha",
                "tagline" => $b['tagline'] ?? "Authentic Homestyle Pure Vegetarian Catering",
                "phone" => $b['phone'] ?? "+1 (978) 652-6164",
                "phoneRaw" => preg_replace('/[^0-9+]/', '', $b['phone'] ?? "+19786526164"),
                "whatsapp" => $b['whatsapp'] ?? "19786526164",
                "email" => $b['email'] ?? "info@radhacatering.com",
                "address" => $b['address'] ?? "Powell, OH 43065",
                "cityState" => $b['city_state'] ?? "Powell, OH",
                "serviceAreas" => $b['service_areas'] ?? "Powell, Dublin, Lewis Center, Columbus & Central Ohio",
                "noticeText" => $b['notice_text'] ?? "Orders are cooked fresh to order. Please order 24–48 hours in advance for party trays.",
                "announcement" => $b['announcement'] ?? "Now accepting weekend catering orders in Powell, OH!"
            ];

            // 2. Fetch Slider Photos
            $stmt = $pdo->query("SELECT `id`, `title`, `tagline`, `category`, `image`, `link` FROM `slider_photos` ORDER BY `sort_order` ASC, `id` ASC");
            $sliderPhotos = $stmt->fetchAll();

            // 3. Fetch Menu Items
            $stmt = $pdo->query("SELECT * FROM `menu_items` ORDER BY `sort_order` ASC, `id` ASC");
            $rawItems = $stmt->fetchAll();
            $items = [];
            foreach ($rawItems as $row) {
                $items[] = [
                    "id" => (int)$row['id'],
                    "title" => $row['title'],
                    "category" => $row['category'],
                    "description" => $row['description'],
                    "halfTrayPrice" => (float)$row['half_tray_price'],
                    "fullTrayPrice" => (float)$row['full_tray_price'],
                    "halfTrayServes" => $row['half_tray_serves'] ?? "10-12 guests",
                    "fullTrayServes" => $row['full_tray_serves'] ?? "20-25 guests",
                    "badge" => $row['badge'],
                    "image" => $row['image'],
                    "isPureVeg" => (bool)$row['is_pure_veg'],
                    "isJainAvailable" => (bool)$row['is_jain_available'],
                    "available" => (bool)$row['available']
                ];
            }

            // Categories list
            $categories = [
                ["id" => "starters", "name" => "Appetizers & Starters"],
                ["id" => "curries", "name" => "Main Course Curries"],
                ["id" => "rice", "name" => "Biryani & Rice"],
                ["id" => "breads", "name" => "Breads & Accompaniments"],
                ["id" => "desserts", "name" => "Desserts & Sweets"],
                ["id" => "packages", "name" => "Special Party Packages"]
            ];

            echo json_encode([
                "businessInfo" => $businessInfo,
                "sliderPhotos" => $sliderPhotos,
                "categories" => $categories,
                "items" => $items,
                "_source" => "mysql"
            ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
            exit;
        } catch (Exception $e) {
            error_log("MySQL fetch failed, falling back to JSON: " . $e->getMessage());
        }
    }

    // Fallback: Read from data/menu.json
    if (file_exists($dataFile)) {
        echo file_get_contents($dataFile);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Menu data file not found']);
    }
    exit;
}

// =========================================================================
// POST: Save Menu Updates (To MySQL if connected + backup to data/menu.json)
// =========================================================================
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $decoded = json_decode($input, true);

    if ($decoded === null || !isset($decoded['items']) || !isset($decoded['businessInfo'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid menu data payload']);
        exit;
    }

    // Always backup & write to data/menu.json
    if (file_exists($dataFile)) {
        @copy($dataFile, __DIR__ . '/../data/menu.backup.json');
    }
    file_put_contents($dataFile, json_encode($decoded, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), LOCK_EX);

    // If MySQL is connected, also update MySQL tables
    if ($pdo) {
        try {
            $pdo->beginTransaction();

            // Update Business Info
            $b = $decoded['businessInfo'];
            $stmt = $pdo->prepare("UPDATE `business_info` SET 
                `business_name` = ?, `phone` = ?, `whatsapp` = ?, `email` = ?, 
                `city_state` = ?, `service_areas` = ?, `notice_text` = ?, `announcement` = ? 
                WHERE `id` = 1");
            $stmt->execute([
                $b['name'] ?? 'Radha Catering',
                $b['phone'] ?? '',
                $b['whatsapp'] ?? '',
                $b['email'] ?? '',
                $b['cityState'] ?? 'Powell, OH',
                $b['serviceAreas'] ?? '',
                $b['noticeText'] ?? '',
                $b['announcement'] ?? ''
            ]);

            // Sync Slider Photos
            if (isset($decoded['sliderPhotos']) && is_array($decoded['sliderPhotos'])) {
                $pdo->exec("DELETE FROM `slider_photos`");
                $stmt = $pdo->prepare("INSERT INTO `slider_photos` (`title`, `tagline`, `category`, `image`, `link`, `sort_order`) VALUES (?, ?, ?, ?, ?, ?)");
                $order = 1;
                foreach ($decoded['sliderPhotos'] as $slide) {
                    $stmt->execute([
                        $slide['title'] ?? '',
                        $slide['tagline'] ?? '',
                        $slide['category'] ?? '',
                        $slide['image'] ?? '',
                        $slide['link'] ?? 'menu.html',
                        $order++
                    ]);
                }
            }

            // Sync Menu Items
            if (isset($decoded['items']) && is_array($decoded['items'])) {
                $pdo->exec("DELETE FROM `menu_items`");
                $stmt = $pdo->prepare("INSERT INTO `menu_items` (`id`, `title`, `category`, `description`, `half_tray_price`, `full_tray_price`, `half_tray_serves`, `full_tray_serves`, `badge`, `image`, `is_pure_veg`, `is_jain_available`, `available`, `sort_order`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                $order = 1;
                foreach ($decoded['items'] as $item) {
                    $stmt->execute([
                        (int)$item['id'],
                        $item['title'],
                        $item['category'],
                        $item['description'] ?? '',
                        (float)$item['halfTrayPrice'],
                        (float)$item['fullTrayPrice'],
                        $item['halfTrayServes'] ?? '10-12 guests',
                        $item['fullTrayServes'] ?? '20-25 guests',
                        $item['badge'] ?? null,
                        $item['image'],
                        !empty($item['isPureVeg']) ? 1 : 0,
                        !empty($item['isJainAvailable']) ? 1 : 0,
                        isset($item['available']) && !$item['available'] ? 0 : 1,
                        $order++
                    ]);
                }
            }

            $pdo->commit();
        } catch (Exception $e) {
            $pdo->rollBack();
            error_log("MySQL sync error: " . $e->getMessage());
        }
    }

    echo json_encode([
        'success' => true,
        'message' => 'Menu saved successfully' . ($pdo ? ' to MySQL & JSON' : ''),
        'timestamp' => date('c'),
        'itemCount' => count($decoded['items']),
        'database' => $pdo ? 'MySQL' : 'JSON file'
    ]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
