# Radha Catering - Pure Vegetarian Home Catering Website

A modern, responsive, and appetizing website built for **Radha Catering** in **Powell, OH**, featuring:
- **Namaste Biryani-inspired Homepage Scrolling Photo Carousel** (continuous infinite multi-card dish slider with pause-on-hover & touch swiping)
- **Menu & Prices Page** with transparent Half Tray (serves 10–12) and Full Tray (serves 20–25) pricing
- **Interactive Party Order & Cost Estimator** with instant WhatsApp order generation
- **Catering Booking Inquiry Form** with event date, guest counter, and dietary options (Satvik, Jain, Mild)
- **Full Admin Screen (`admin.html`)** for Radha to:
  - Add, edit, and delete dishes
  - Update dish names, descriptions, and half/full tray prices
  - **Upload new pictures** directly from her computer or phone (saved to `uploads/`)
  - Manage the **Homepage Scrolling Photo Carousel** (add/remove photos & banners)
  - Update business info (phone, WhatsApp, announcement banner)

---

## 🚀 Quick Local Testing (On Your Computer)

You can run the included Python server to test everything locally, including the Admin portal and picture uploads:

1. Open PowerShell or Command Prompt in this folder (`c:\Users\punur\projects\RadhaCatering`).
2. Run:
   ```bash
   python server.py
   ```
3. Open your browser to:
   - **Main Website:** `http://localhost:8080`
   - **Menu & Prices:** `http://localhost:8080/menu.html`
   - **Contact & Inquiry:** `http://localhost:8080/contact.html`
   - **Owner Admin Portal:** `http://localhost:8080/admin.html`
     - **Default Passcode:** `RadhaAdmin2024`

---

## 🌐 How to Host on Hostinger (Step-by-Step Guide)

Hostinger supports static HTML/CSS/JS and PHP natively out of the box on all shared and cloud hosting plans. No complex server setup is required!

### Step 1: Prepare the Files
Compress the entire contents of this project folder into a ZIP file (e.g., `RadhaCatering.zip`).
Make sure the zip contains:
```
├── index.html
├── menu.html
├── contact.html
├── admin.html
├── .htaccess
├── css/
├── js/
├── data/
│   └── menu.json
├── uploads/
└── api/
    ├── menu.php
    └── upload.php
```

### Step 2: Upload to Hostinger
1. Log in to your **Hostinger Account** (hPanel).
2. Go to **Websites** and click **Manage** next to your domain.
3. In the left menu, search for **File Manager** (under *Files*).
4. Click **Access files of [your domain]** and open the **`public_html`** folder.
5. Click the **Upload** icon (top right), choose your `RadhaCatering.zip`, and upload it.
6. Right-click the uploaded ZIP file in `public_html` and click **Extract**. Extract it directly into `public_html`.
7. (Optional) Delete the ZIP file after extracting.

### Step 3: Check Permissions
- Ensure the `uploads/` folder has permission `755` (default on Hostinger) so the PHP upload script can save newly uploaded dish photos.
- Ensure `data/menu.json` has permission `644` or `664` so the admin screen can save updated prices.

### Step 4: Visit Your Live Site
Open `https://yourdomain.com` in your web browser!

---

## 🔐 How to Use the Admin Portal

1. Go to `https://yourdomain.com/admin.html` (or click "Admin Login" in the website footer).
2. Enter the owner passcode: **`RadhaAdmin2024`**
3. In the Admin Dashboard:
   - **To Edit an Item or Price:** Click **Edit** next to any dish, change the title, half tray price, or full tray price, and click **Save Dish**.
   - **To Upload a Picture:** In the Edit/Add modal, click **Choose File** under "Upload Image File" to select a photo from your computer or phone. The photo will automatically upload and preview.
   - **To Update the Homepage Scrolling Carousel:** Click the **Homepage Scrolling Carousel** tab, where you can add new slide photos, update taglines, or remove photos.
   - **To Save to Server:** Click the green **"Save All Changes"** button at the top right. This immediately writes the updates to the server.
   - **Backup:** You can also click **Backup JSON** to download a copy of `menu.json` to your computer anytime.

---

## 📞 Business Configuration
- **Business Name:** Radha Catering
- **Location:** Powell, OH 43065
- **Phone:** +1 (978) 652-6164
- **WhatsApp:** 19786526164
- **Dietary:** 100% Pure Vegetarian (Satvik & Jain Options Available)

---

## 💻 Developer & Credits
- **Developed By:** **Sphire Solution LLC**
- **Location:** Delaware, OH

