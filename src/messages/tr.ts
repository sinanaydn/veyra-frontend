/**
 * Central Turkish copy catalog.
 * Reference: NFR-I18N-1
 *
 * No hardcoded user-facing strings in components — every label, button,
 * empty state, error must reference `t.<namespace>.<key>` from here.
 *
 * Naming: namespaces are lowercase singulars (auth, cars, booking, admin).
 * Keys are camelCase, descriptive (signInCta, emptyResults, dateConflict).
 */

export const t = {
  // ============================================================
  // Common — buttons, statuses, generic copy
  // ============================================================
  common: {
    appName: "Veyra RentACar",
    save: "Kaydet",
    cancel: "Vazgeç",
    delete: "Sil",
    edit: "Düzenle",
    confirm: "Onayla",
    close: "Kapat",
    back: "Geri",
    next: "İleri",
    previous: "Önceki",
    submit: "Gönder",
    loading: "Yükleniyor…",
    saving: "Kaydediliyor…",
    deleting: "Siliniyor…",
    search: "Ara",
    filter: "Filtrele",
    clear: "Temizle",
    reset: "Sıfırla",
    apply: "Uygula",
    yes: "Evet",
    no: "Hayır",
    of: "/", // for "1 / 5" pagination
    page: "Sayfa",
    rowsPerPage: "Sayfa başına",
    noResults: "Sonuç yok.",
    skipToContent: "İçeriğe atla",
    requiredField: "Zorunlu",
    optional: "İsteğe bağlı",
    perDay: "/ gün",
  },

  // ============================================================
  // Navigation
  // ============================================================
  nav: {
    home: "Ana Sayfa",
    cars: "Araçlar",
    brands: "Markalar",
    account: "Hesabım",
    rentals: "Kiralamalarım",
    payments: "Ödemelerim",
    settings: "Ayarlar",
    admin: "Yönetim",
    dashboard: "Panel",
    login: "Giriş Yap",
    register: "Kayıt Ol",
    logout: "Çıkış Yap",
    themeToggle: "Tema değiştir",
    openMenu: "Menüyü aç",
    closeMenu: "Menüyü kapat",
    profile: "Profil",
  },

  // ============================================================
  // Auth (login, register)
  // ============================================================
  auth: {
    loginTitle: "Tekrar hoş geldin",
    loginSubtitle: "Devam etmek için hesabına giriş yap.",
    registerTitle: "Hesap oluştur",
    registerSubtitle: "Saniyeler içinde hesap aç, hemen yola çık.",

    email: "E-posta",
    password: "Şifre",
    firstName: "Ad",
    lastName: "Soyad",
    phone: "Telefon",
    phoneHint: "İsteğe bağlı — örn. +90 555 123 45 67",

    signInCta: "Giriş Yap",
    signUpCta: "Hesap Oluştur",
    signingIn: "Giriş yapılıyor…",
    signingUp: "Hesap oluşturuluyor…",

    noAccountYet: "Hesabın yok mu?",
    haveAccount: "Zaten hesabın var mı?",
    forgotPassword: "Şifremi unuttum",
    forgotPasswordSoon: "Yakında",

    passwordRules:
      "En az 10 karakter, bir küçük harf, bir büyük harf, bir rakam ve bir özel karakter.",
    rateLimitedPrefix: "Çok fazla deneme — ",
    rateLimitedSuffix: " sn sonra tekrar dene.",

    accountLockedBanner:
      "Hesabın 5 hatalı denemenin ardından kilitlendi. 30 dakika sonra tekrar dene.",

    showPassword: "Şifreyi göster",
    hidePassword: "Şifreyi gizle",

    strength: "Şifre gücü",
    strengthWeak: "Zayıf",
    strengthFair: "Orta",
    strengthStrong: "Güçlü",
    strengthExcellent: "Çok güçlü",

    asideEyebrow: "ERİŞİM // 01",
    asideHeadline: "Kapına gelen lüks.",
    asideHeadlineDim: "Tek tıkla anahtar elinde.",
    asideStatFleet: "filomdaki araç",
    asideStatBrands: "premium marka",
    asideStatCities: "teslim noktası",
    asideQuote:
      "Premium hissi, kullanışın kolaylığı. Veyra, kiralamayı yeniden yazıyor.",
    asideMeta: "VEYRA · TR · TRY",
  },

  // ============================================================
  // Marketing / cars catalog
  // ============================================================
  cars: {
    heroHeadline: "Lüksü kirala. Anında yola çık.",
    heroSubhead:
      "Premium araç filomuzda saniyeler içinde rezerve et, kapına teslim al.",
    heroCta: "Aracını seç",

    catalogTitle: "Araçlar",
    catalogSubtitle: "Filomdaki tüm araçları keşfet.",

    filters: "Filtreler",
    filtersOpen: "Filtreleri aç",
    filtersClose: "Filtreleri kapat",
    filtersClear: "Filtreleri sıfırla",

    sort: "Sırala",
    sortNewest: "En yeni",
    sortPriceAsc: "Fiyat — düşükten yükseğe",
    sortPriceDesc: "Fiyat — yüksekten düşüğe",
    sortYearDesc: "Model yılı — yeniden eskiye",

    brand: "Marka",
    model: "Model",
    fuelType: "Yakıt",
    transmission: "Vites",
    priceRange: "Fiyat aralığı",
    yearRange: "Yıl aralığı",
    availableOnly: "Sadece kiralanabilir",

    fuelGasoline: "Benzin",
    fuelDiesel: "Dizel",
    fuelElectric: "Elektrik",
    fuelHybrid: "Hibrit",

    transmissionManual: "Manuel",
    transmissionAutomatic: "Otomatik",

    statusAvailable: "Müsait",
    statusRented: "Kirada",
    statusMaintenance: "Bakımda",

    seats: "kişilik",
    doors: "kapı",
    baggage: "bagaj",

    emptyTitle: "Bu kriterlere uygun araç bulunamadı.",
    emptyAction: "Filtreleri sıfırla",
    rateLimitBanner:
      "Çok hızlı geziniyorsun. {n} sn sonra tekrar dene.",

    detailSpecs: "Özellikler",
    detailDescription: "Açıklama",
    detailSimilar: "Benzer araçlar",
    galleryNext: "Sonraki görsel",
    galleryPrev: "Önceki görsel",
    galleryClose: "Galeriyi kapat",
  },

  // ============================================================
  // Booking & payment
  // ============================================================
  booking: {
    widgetTitle: "Bu aracı kirala",
    startDate: "Alış",
    endDate: "Teslim",
    selectDates: "Tarih seç",
    days: "gün",
    dailyRate: "Günlük",
    total: "Toplam",
    bookCta: "Kirala",
    booking: "Rezerve ediliyor…",
    loginRequired: "Devam etmek için giriş yap",

    dateConflict:
      "Seçtiğin tarihler bu araç için dolu. Başka tarihler dene.",
    dateInvalid: "Geçersiz tarih aralığı.",

    checkoutTitle: "Ödeme",
    checkoutSubtitle: "Kart bilgilerini gir, kiralamanı tamamla.",
    summaryTitle: "Sipariş özeti",

    cardNumber: "Kart Numarası",
    cardName: "Kart Üzerindeki İsim",
    cardExpiry: "Son Kullanım",
    cardCvc: "CVC",
    cardExpiryPlaceholder: "AA/YY",
    payCta: "Ödemeyi Tamamla",
    paying: "Ödeme alınıyor…",

    confirmingTitle: "Rezervasyonun hazırlanıyor…",
    confirmingSub: "Birkaç saniye sürebilir.",
    confirmedTitle: "Hazır! Anahtarın seni bekliyor.",
    confirmedSub: "Rezervasyonun onaylandı.",
    viewRentalsCta: "Kiralamalarıma git",
    viewReceiptCta: "Makbuzu görüntüle",
  },

  // ============================================================
  // Account
  // ============================================================
  account: {
    profileTitle: "Profil",
    rentalsTitle: "Kiralamalarım",
    paymentsTitle: "Ödemelerim",
    settingsTitle: "Ayarlar",

    rentalsEmpty: "Henüz kiralama geçmişin yok.",
    rentalsEmptyCta: "Araçları keşfet",
    paymentsEmpty: "Henüz ödeme geçmişin yok.",

    statusPending: "Beklemede",
    statusConfirmed: "Onaylandı",
    statusActive: "Aktif",
    statusCompleted: "Tamamlandı",
    statusCancelled: "İptal edildi",

    paymentPending: "Beklemede",
    paymentCompleted: "Tamamlandı",
    paymentFailed: "Başarısız",
    paymentRefunded: "İade edildi",

    cancelRental: "İptal Et",
    cancelRentalConfirm:
      "Bu kiralamayı iptal etmek istediğinden emin misin?",
    payNow: "Şimdi Öde",

    receiptTitle: "Ödeme Makbuzu",
    receiptId: "İşlem No",
    receiptDate: "Tarih",
    receiptAmount: "Tutar",
    receiptStatus: "Durum",

    settingsReadOnlyNote:
      "Bilgilerini güncellemek için destek ekibimize ulaş.",
    dangerZone: "Tehlikeli Bölge",
    deleteAccount: "Hesabımı Sil",
    deleteAccountWarning:
      "Hesabın silindiğinde tüm verilerin kalıcı olarak silinir. Bu işlem geri alınamaz.",
    deleteAccountConfirmEmail:
      "Onaylamak için e-postanı tekrar yaz:",
    deleteAccountTypeMismatch:
      "E-postan eşleşmiyor. Tam olarak yazman gerek.",
    deleteAccountSuccess: "Hesabın silindi. Görüşmek üzere.",

    // Profile snapshot
    welcomeBack: "Tekrar hoş geldin",
    memberSince: "Üyelik",
    sessionId: "Oturum",
    accountSummary: "Hesap özeti",
    quickLinks: "Hızlı bağlantılar",

    // Stats
    statTotalRentals: "Toplam kiralama",
    statActiveRentals: "Aktif",
    statSpent: "Harcama",
    statTotalPayments: "Ödeme",

    // Rentals list
    rentalsSubtitle: "Tüm kiralama hareketlerin tek bir akışta.",
    rentalRef: "Rezervasyon",
    rentalCar: "Araç",
    rentalDates: "Tarih aralığı",
    rentalDuration: "Süre",
    rentalTotal: "Toplam",
    rentalDays: "{n} gün",
    rentalCreated: "Oluşturulma",
    rentalViewDetail: "Detayı gör",

    // Rental detail
    rentalDetailTitle: "Kiralama detayı",
    rentalTimelineTitle: "Durum",
    rentalCarSnapshot: "Araç",
    rentalActions: "İşlemler",
    rentalCancelled: "Bu kiralama iptal edildi.",
    rentalCompleted: "Bu kiralama tamamlandı.",
    rentalCancelTitle: "Kiralamayı iptal et",
    rentalCancelDesc:
      "Bu işlem geri alınamaz. İptal sonrası ödeme yapıldıysa iade süreci destek tarafından yürütülür.",
    rentalCancelConfirm: "Evet, iptal et",
    rentalCancelKeep: "Vazgeç",

    // Timeline steps
    stepPending: "Beklemede",
    stepConfirmed: "Onaylandı",
    stepActive: "Aktif",
    stepCompleted: "Tamamlandı",
    stepCancelled: "İptal",

    // Payments
    paymentsSubtitle: "Tüm ödemelerinin kayıtları.",
    paymentRef: "İşlem",
    paymentRental: "Kiralama",
    paymentDate: "Tarih",
    paymentAmount: "Tutar",

    // Receipt
    receiptSubtitle: "Lütfen kayıtların için sakla.",
    receiptIssued: "Düzenlenme",
    receiptItem: "Hizmet",
    receiptItemRental: "Araç kiralama",
    receiptSubtotal: "Ara toplam",
    receiptVat: "KDV (dahil)",
    receiptTotal: "Toplam",
    receiptThanks: "Veyra'yı tercih ettiğin için teşekkürler.",
    receiptViewRental: "İlgili kiralamayı gör",

    // Settings
    settingsSubtitle: "Profil bilgilerin ve hesap yönetimi.",
    profileFullName: "Ad Soyad",
    profileEmail: "E-posta",
    profilePhone: "Telefon",
    profilePhoneEmpty: "Belirtilmemiş",
    profileMemberSince: "Üye olduğun tarih",

    // Empty states
    rentalsEmptySub:
      "İlk rezervasyonunu yap, anahtarın kapına gelsin.",
    paymentsEmptySub: "Ödeme geçmişin burada görünecek.",
  },

  // ============================================================
  // Admin
  // ============================================================
  admin: {
    dashboardTitle: "Yönetim Paneli",
    statRentals: "Toplam Kiralama",
    statPayments: "Toplam Ödeme",
    statRecentActivity: "Son hareketler",

    sectionUsers: "Kullanıcılar",
    sectionBrands: "Markalar",
    sectionModels: "Modeller",
    sectionCars: "Araçlar",
    sectionImages: "Görseller",
    sectionRentals: "Kiralamalar",
    sectionPayments: "Ödemeler",

    addBrand: "Marka Ekle",
    addModel: "Model Ekle",
    addCar: "Araç Ekle",
    editCar: "Aracı Düzenle",
    manageImages: "Görseller",

    deleteConfirm: "Silmek istediğine emin misin?",
    deleteConfirmIrreversible:
      "Bu işlem geri alınamaz. Devam etmek istiyor musun?",

    roleUser: "Kullanıcı",
    roleAdmin: "Yönetici",
    changeRole: "Rol Değiştir",
    cannotDemoteSelf: "Kendi rolünü değiştiremezsin.",
    cannotDeleteSelf: "Kendi hesabını silemezsin.",

    completeRental: "Tamamla",
    cancelRentalAdmin: "İptal Et",

    imagesDropzone: "Görselleri buraya bırak veya tıkla",
    imagesDropzoneHint:
      "JPEG, PNG veya WebP — en fazla 5 MB. Bir araca en fazla 10 görsel.",
    imagesLimit: "{count}/10 görsel",
    imagesLimitReached: "Bu araç için maksimum görsel sayısına ulaştın.",
    imagesUploading: "Yükleniyor… %{pct}",
    imagesSetPrimary: "Kapak yap",
    imagesPrimary: "Kapak",
    imagesDelete: "Sil",
    imagesReorderHint: "Sürükleyerek sırasını değiştir.",
  },

  // ============================================================
  // Errors & generic states
  // ============================================================
  errors: {
    title: "Bir şeyler ters gitti",
    description: "Lütfen sayfayı yenile veya tekrar dene.",
    retry: "Tekrar dene",
    networkError: "Bağlantı sorunu. İnternetini kontrol et.",
    notFoundTitle: "Sayfa bulunamadı",
    notFoundDescription:
      "Aradığın sayfa taşınmış ya da hiç var olmamış olabilir.",
    backHome: "Ana sayfaya dön",
    accessDeniedTitle: "Erişim engellendi",
    accessDeniedDescription: "Bu sayfaya erişim yetkin yok.",
  },
} as const;

export type Messages = typeof t;
