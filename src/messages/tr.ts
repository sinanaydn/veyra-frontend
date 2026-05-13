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

    // Step indicator
    stepCardLabel: "KART",
    stepConfirmLabel: "ONAY",
    stepCardEyebrow: "ADIM 01",
    stepConfirmEyebrow: "ADIM 02",

    // Card preview
    cardHolderPlaceholder: "AD SOYAD",
    cardNumberPlaceholder: "•••• •••• •••• ••••",
    cardExpiryShortPlaceholder: "••/••",
    cardCvcPlaceholder: "•••",
    cardSecureNote: "Bu bir simülasyon ödemesidir. Gerçek kart bilgilerini girme.",
    cardChipLabel: "VEYRA · GLOBAL",
    cardBackTagline: "Anahtarın yola hazır.",

    // Validation
    cardNumberInvalid: "Kart numarası 13–19 haneli olmalı.",
    cardNameInvalid: "İsim en az 2 karakter olmalı.",
    cardExpiryInvalid: "Son kullanım AA/YY formatında olmalı.",
    cardExpiryPast: "Son kullanım tarihi geçmiş.",
    cardCvcInvalid: "CVC 3–4 haneli olmalı.",

    // Checkout chrome
    checkoutEyebrow: "ÖDEME // VEYRA",
    checkoutSecureLine: "256-bit şifreleme · iade güvencesi",
    summaryRef: "REZERVASYON",
    summaryDailyRate: "Günlük",
    summaryDays: "{n} gün",
    summarySubtotal: "Ara toplam",
    summaryVat: "KDV (dahil)",
    summaryTotal: "Toplam",
    summaryIdemHint: "Aynı oturumda tekrar denemen güvenli.",

    notPendingTitle: "Bu rezervasyon ödemeye uygun değil.",
    notPendingSub: "Rezervasyon durumunu hesabımdan kontrol et.",

    // Confirmation page
    confirmingTitle: "Rezervasyonun hazırlanıyor…",
    confirmingSub: "Birkaç saniye sürebilir.",
    confirmingAttempt: "{n}/{max} kontrol",
    confirmedTitle: "Hazır! Anahtarın seni bekliyor.",
    confirmedSub: "Rezervasyonun onaylandı.",
    confirmedEyebrow: "REZERVASYON ONAYI",
    pollTimeoutTitle: "İşlemin hâlâ devam ediyor.",
    pollTimeoutSub:
      "Onay birkaç dakika sürebilir. Hesabımdan durumu takip edebilirsin.",
    viewRentalsCta: "Kiralamalarıma git",
    viewReceiptCta: "Makbuzu görüntüle",
    backToCheckoutCta: "Ödemeye dön",
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

    // ─── Editorial chrome ───
    eyebrowDashboard: "VEYRA · YÖNETİM // 00",
    eyebrowBrands: "KATALOG // 01",
    eyebrowModels: "KATALOG // 02",
    eyebrowCars: "KATALOG // 03",
    eyebrowImages: "KATALOG // 04",
    eyebrowRentals: "OPERASYON // 05",
    eyebrowPayments: "OPERASYON // 06",
    eyebrowUsers: "OPERASYON // 07",

    dashboardSubtitle:
      "Operasyon ve katalog tek bir akışta — anlık durum, hızlı eylem.",

    // Dashboard stats
    statTotalRentals: "Toplam kiralama",
    statActiveRentals: "Aktif kiralama",
    statTotalPayments: "Tamamlanan ödeme",
    statRevenue: "Toplam ciro",
    statFleet: "Filo (araç)",
    statBrands: "Marka",
    statModels: "Model",
    statUsers: "Kullanıcı",

    recentRentals: "Son rezervasyonlar",
    recentPayments: "Son ödemeler",
    viewAll: "Hepsini gör",

    // Brands page
    brandsSubtitle: "Filodaki tüm markalar.",
    brandFormTitle: "Marka",
    brandFormCreate: "Yeni marka",
    brandFormEdit: "Markayı düzenle",
    brandNameLabel: "Marka adı",
    brandNamePlaceholder: "Örn. Volvo",
    brandsEmpty: "Henüz marka eklemedin.",
    brandDeletedTitle: "Marka silindi.",
    brandCreatedTitle: "Marka eklendi.",
    brandUpdatedTitle: "Marka güncellendi.",

    // Models
    modelsSubtitle: "Markalara bağlı tüm modeller.",
    modelFormTitle: "Model",
    modelFormCreate: "Yeni model",
    modelFormEdit: "Modeli düzenle",
    modelNameLabel: "Model adı",
    modelNamePlaceholder: "Örn. XC60",
    modelBrandLabel: "Marka",
    modelsEmpty: "Bu kriterlere uygun model yok.",
    modelCreatedTitle: "Model eklendi.",
    modelUpdatedTitle: "Model güncellendi.",
    modelDeletedTitle: "Model silindi.",

    // Cars
    carsSubtitle: "Filodaki tüm araçlar.",
    carFormCreate: "Yeni araç",
    carFormEdit: "Aracı düzenle",
    carFormSubtitleCreate:
      "Modeli seç, özellikleri gir. Görselleri sonra ekleyebilirsin.",
    carFormSubtitleEdit:
      "Araç özelliklerini ve durumunu güncelle. Görseller ayrı yönetilir.",
    carsEmpty: "Filoda henüz araç yok.",
    carCreatedTitle: "Araç eklendi.",
    carUpdatedTitle: "Araç güncellendi.",
    carDeletedTitle: "Araç silindi.",

    // Car form fields
    fieldBrand: "Marka",
    fieldModel: "Model",
    fieldYear: "Yıl",
    fieldDoors: "Kapı",
    fieldBaggages: "Bagaj",
    fieldSeats: "Koltuk",
    fieldDailyPrice: "Günlük ücret (₺)",
    fieldFuel: "Yakıt",
    fieldTransmission: "Vites",
    fieldColor: "Renk",
    fieldMileage: "Kilometre",
    fieldDescription: "Açıklama",
    fieldStatus: "Durum",
    fieldBrandPlaceholder: "Marka seç…",
    fieldModelPlaceholder: "Model seç…",
    fieldStatusPlaceholder: "Durum seç…",

    statusAvailable: "Müsait",
    statusRented: "Kirada",
    statusMaintenance: "Bakımda",

    // Images
    imagesSubtitle: "Yükle, sırala, kapak seç. Maks. 10 görsel.",
    imagesEmpty: "Bu araç için henüz görsel yok.",
    imageUploaded: "Görsel yüklendi.",
    imageUploadFailed: "Görsel yüklenemedi.",
    imageInvalidType: "Sadece JPEG, PNG veya WebP yükleyebilirsin.",
    imageTooLarge: "Görsel 5 MB'tan büyük olamaz.",
    imageReorderFailed: "Sıralama kaydedilemedi.",
    imagePrimaryUpdated: "Kapak görseli güncellendi.",
    imageDeleted: "Görsel silindi.",
    backToCar: "Araca dön",

    // Rentals admin
    rentalsAdminSubtitle:
      "Tüm rezervasyonlar — kullanıcı kimliğine göre filtrele, tamamla veya iptal et.",
    rentalsEmpty: "Bu kriterlere uygun kiralama yok.",
    filterByUserId: "Kullanıcı ID",
    filterByStatus: "Durum",
    filterReset: "Filtreleri sıfırla",
    allStatuses: "Tümü",
    rentalCompletedTitle: "Kiralama tamamlandı.",
    rentalCancelledTitle: "Kiralama iptal edildi.",
    rentalCompleteConfirm:
      "Bu kiralamayı tamamlanmış olarak işaretlemek istediğine emin misin?",
    rentalCancelConfirmAdmin:
      "Bu kiralamayı iptal etmek istediğine emin misin? Bu işlem geri alınamaz.",

    // Payments admin
    paymentsAdminSubtitle: "Tüm ödemelerin denetim kaydı. Salt okunur.",
    paymentsEmpty: "Bu kriterlere uygun ödeme yok.",
    paymentRefShort: "İşlem",
    paymentRentalShort: "Kiralama",

    // Users
    usersSubtitle: "Tüm kullanıcılar — rol değiştir, hesap kapat.",
    usersEmpty: "Henüz kullanıcı yok.",
    userYou: "Sen",
    userDeleted: "Kullanıcı silindi.",
    userRoleChanged: "Rol güncellendi.",
    promoteUser: "Yönetici yap",
    demoteUser: "Kullanıcıya çevir",

    // Common admin chrome
    tableId: "ID",
    tableName: "Ad",
    tableEmail: "E-posta",
    tablePhone: "Telefon",
    tableCreatedAt: "Eklenme",
    tableActions: "İşlem",
    tableBrand: "Marka",
    tableModel: "Model",
    tableYear: "Yıl",
    tablePrice: "Günlük",
    tableStatus: "Durum",
    tableCustomer: "Kullanıcı",
    tableDates: "Tarih",
    tableTotal: "Toplam",
    tableAmount: "Tutar",
    tableRental: "Kiralama",
    tableFuel: "Yakıt",
    tableTransmission: "Vites",
    rowsCount: "{n} kayıt",
    pageOf: "{a} / {b}",
    confirmTitle: "Emin misin?",
    confirmDeleteTitle: "Silmek istediğine emin misin?",
    confirmDestructiveCta: "Evet, sil",
    confirmKeepCta: "Vazgeç",
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
