## 🚨 ISSUE: Photo Capture Loop - Android App Side

### **Problem Description**
Photos dari device Vivo dengan ID `vivo_1806_86d0422ff9de8bf3` terus di-capture dan di-upload berkali-kali di waktu yang sama, menghasilkan duplikasi dalam sistem.

### **Evidence dari Logs Firebase**
```
[22:14] ⚡ Perintah: Ambil Foto       ← Command sent to app
[22:14] 📸 Photo captured and synced   ← Photo 1
[22:14] 📸 Photo captured and synced   ← Photo 2 (DUPLIKAT)
[22:14] 📸 Photo captured and synced   ← Photo 3 (DUPLIKAT)
```

Terjadi dalam interval 1 detik, padahal seharusnya hanya capture **1x per request**.

---

### **Root Cause Analysis**

Ada kemungkinan ada infinite loop atau interval otomatis di KeiService.java:

#### ❌ **Contoh 1: Infinite Loop** 
```java
// WRONG - Jangan begini!
while (true) {
    capturePhoto();
    if (stopFlag) break;
}
```

#### ❌ **Contoh 2: Auto-interval tanpa batas**
```java
// WRONG - Terus capture setiap 30 detik tanpa stop
handler.postDelayed(() -> {
    capturePhoto();
    // Calls itself again recursively
}, 30000);
```

#### ❌ **Contoh 3: Multiple listeners/callbacks**
```java
// WRONG - Listener dipanggil berkali-kali
private void setupPhotoListener() {
    // Called multiple times in onCreate()
    camera.setOnPhotoCapture(() -> capturePhoto());
}
```

---

### **Solusi yang Benar**

#### ✅ **Capture hanya ketika user request**
```java
public void capturePhoto() {
    // ONCE PER REQUEST - jangan loop
    boolean success = takePhoto();
    if (success) {
        uploadToFirebase();
        logActivity("📸 Photo captured and synced");
    }
}
```

#### ✅ **Jika ada interval, harus bisa di-stop**
```java
// Hanya jalan ketika auto-capture ENABLED
private Handler photoHandler = new Handler(Looper.getMainLooper());
private Runnable photoTask = () -> {
    if (AUTO_CAPTURE_ENABLED) {
        capturePhoto();
        // Re-schedule untuk next interval
        photoHandler.postDelayed(photoTask, 60000); // 60 detik
    }
};

// Ini bisa di-stop kapan saja
public void stopAutoCapture() {
    AUTO_CAPTURE_ENABLED = false;
    photoHandler.removeCallbacks(photoTask);
}
```

#### ✅ **Listener hanya di-register sekali**
```java
@Override
public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    
    // Register listener HANYA SEKALI
    if (photoCaptureListener == null) {
        setupPhotoListener();
    }
}

private void setupPhotoListener() {
    camera.setOnPhotoCapture(() -> {
        capturePhoto(); // Called 1x per capture event
    });
    photoCaptureListener = true;
}
```

---

### **Checklist untuk Di-Fix di Flying Bird App**

- [ ] **Cek `KeiService.java`** - apakah ada while loop atau infinite recursion di photo capture?
- [ ] **Cek `CameraManager.java` atau handler foto** - apakah `postDelayed()` di-call berkali-kali?
- [ ] **Cek Firebase upload logic** - apakah ada retry loop yang tidak terkontrol?
- [ ] **Pastikan `stopAutoCapture()` berfungsi** - jika ada auto-capture feature
- [ ] **Add safeguard**: Jangan upload foto dengan timestamp yang sama 2x dalam 5 detik
- [ ] **Log improvements**: Sebelum capture, log: `"About to capture photo (counter: X)"`

---

### **Testing Steps**

1. **Deploy fix ke device**
2. **Trigger capture dari web dashboard**
   - Klik tombol "CAPTURE NOW" di `/dashboard/camera`
3. **Monitor Firebase logs**
   - Check `/system_logs/{deviceId}` 
   - Seharusnya hanya ada 1 `"📸 Photo captured and synced"` per request
4. **Ulangi 5x capture**
   - Pastikan tidak ada duplikasi

---

### **Expected Behavior**

```
[Timeline]
22:14:00 → User klik CAPTURE NOW di dashboard
22:14:00 → Web kirim command ke Firebase
22:14:01 → App terima command
22:14:02 → App capture 1 foto ← hanya 1
22:14:03 → App upload ke Firebase
22:14:03 → Log: "📸 Photo captured and synced" ← hanya 1x

[Jika capture lagi]
22:15:00 → User klik CAPTURE lagi
22:15:01 → [Prosess sama, 1 foto]
```

---

### **Questions untuk Developer**

1. **Berapa lama development lifetime photo capture?**
   - Kapan photo listeners di-setup?
   - DiReset di onDestroy?

2. **Ada background task untuk auto-capture?**
   - If yes, bagaimana di-stop ketika app minimize?

3. **Upload logic**
   - Retry otomatis? Berapa kali?
   - Timeout setting berapa?

---

### **Priority: HIGH** 🔴

Karena duplikasi ini:
- ❌ Menghabiskan storage Firebase
- ❌ Membebani network
- ❌ Membuat logs tidak valid untuk analisis
- ❌ Kurangi lifetime battery device

---

**Contact**: Ping saat sudah di-fix agar bisa verify di live device!
