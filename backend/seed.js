require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Tour = require('./models/Tour');
const Blog = require('./models/Blog');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB bağlantısı başarılı');

    // Veritabanını temizle
    await User.deleteMany({});
    await Tour.deleteMany({});
    await Blog.deleteMany({});

    // Admin kullanıcı oluştur
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = await User.create({
      email: 'admin@gezsektravel.com',
      passwordHash: adminPassword,
      name: 'Admin User',
      phone: '5551234567',
      birthDate: new Date('1990-01-15'),
      gender: 'erkek',
      verified: true,
      isAdmin: true
    });

    // Normal kullanıcı oluştur
    const userPassword = await bcrypt.hash('user123', 12);
    const user = await User.create({
      email: 'user@gezsektravel.com',
      passwordHash: userPassword,
      name: 'Test User',
      phone: '5559876543',
      birthDate: new Date('1995-06-20'),
      gender: 'kadın',
      verified: true
    });

    // Örnek turlar oluştur
    const tours = await Tour.create([
      {
        title: 'Kapadokya Balon Turu',
        description: 'Muhteşem Kapadokya manzarasını balondan izleyin. Peri bacalarının üzerinde süzülerek unutulmaz anlar yaşayın.',
        price: 2500,
        originalPrice: 3000,
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500',
        duration: '4 saat',
        location: 'Kapadokya, Nevşehir',
        category: 'Kültür Turları',
        highlights: 'Balon turu, kahvaltı, fotoğraf çekimi, transfer',
        dates: 'Her gün sabah 05:00',
        maxParticipants: 20,
        isActive: true
      },
      {
        title: 'Antalya Deniz Turu',
        description: 'Kekova ve batık şehir turu ile unutulmaz deniz deneyimi. Turkuaz sularında yüzme molası.',
        price: 1800,
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500',
        duration: '8 saat',
        location: 'Antalya, Kaş',
        category: 'Yaz Turları',
        highlights: 'Kekova adası, batık şehir, yüzme molası, öğle yemeği',
        dates: 'Her gün 09:00',
        maxParticipants: 30,
        isActive: true
      },
      {
        title: 'İstanbul Kültür Turu',
        description: 'Tarihi yarımada ve Osmanlı mimarisini keşfedin. Ayasofya, Topkapı Sarayı ve Sultanahmet Camii.',
        price: 1200,
        image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=500',
        duration: '6 saat',
        location: 'İstanbul',
        category: 'Kültür Turları',
        highlights: 'Ayasofya, Topkapı Sarayı, Sultanahmet, rehberlik',
        dates: 'Her gün 09:30',
        maxParticipants: 25,
        isActive: true
      },
      {
        title: 'Karadeniz Yayla Turu',
        description: 'Doğanın kalbinde, yaylalarda unutulmaz bir deneyim! Uzungöl, Ayder ve Pokut yaylaları.',
        price: 3500,
        image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=500',
        duration: '3 gün 2 gece',
        location: 'Trabzon, Rize',
        category: 'Doğa Turları',
        highlights: 'Uzungöl, Ayder Yaylası, Pokut Yaylası, konaklama',
        dates: 'Her hafta sonu',
        maxParticipants: 15,
        isActive: true
      },
      {
        title: 'Ege Akdeniz Turu',
        description: 'Ege ve Akdeniz\'in en güzel koyları, deniz ve güneşle dolu bir tatil! Bodrum, Marmaris, Fethiye.',
        price: 4500,
        image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=500',
        duration: '5 gün 4 gece',
        location: 'Bodrum, Marmaris, Fethiye',
        category: 'Yaz Turları',
        highlights: 'Bodrum kalesi, Marmaris koyları, Fethiye Ölüdeniz',
        dates: 'Her hafta pazartesi',
        maxParticipants: 20,
        isActive: true
      },
      {
        title: 'GAP Turu',
        description: 'Güneydoğu\'nun eşsiz şehirleri, kültür ve lezzet dolu bir rota! Gaziantep, Şanlıurfa, Mardin.',
        price: 2800,
        image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?w=500',
        duration: '4 gün 3 gece',
        location: 'Gaziantep, Şanlıurfa, Mardin',
        category: 'Kültür Turları',
        highlights: 'Göbeklitepe, Balıklıgöl, Mardin evleri, gastronomi',
        dates: 'Her ayın ilk haftası',
        maxParticipants: 18,
        isActive: true
      },
      {
        title: 'Günübirlik Abant & Gölcük Turu',
        description: 'Şehirden kaçış, doğayla buluşma! Sabah çıkış, akşam dönüş. Abant ve Gölcük gölleri.',
        price: 800,
        image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=500',
        duration: '12 saat',
        location: 'Bolu',
        category: 'Günübirlik Turlar',
        highlights: 'Abant Gölü, Gölcük Gölü, doğa yürüyüşü, öğle yemeği',
        dates: 'Her hafta sonu',
        maxParticipants: 40,
        isActive: true
      },
      {
        title: 'Kıbrıs Turu',
        description: 'Kıbrıs\'ın eşsiz güzellikleri. Lefkoşa, Girne, Gazimağusa ve Baf şehirleri.',
        price: 3800,
        image: 'https://images.unsplash.com/photo-1465156799763-2c087c332922?w=500',
        duration: '5 gün 4 gece',
        location: 'Kıbrıs',
        category: 'Kıbrıs Turları',
        highlights: 'Lefkoşa, Girne kalesi, Gazimağusa, Baf antik kenti',
        dates: 'Her ayın 15\'i',
        maxParticipants: 25,
        isActive: true
      }
    ]);

    // Örnek blog yazıları oluştur
    const blogs = await Blog.create([
      {
        title: 'Kapadokya\'da Balon Turu Deneyimi',
        content: 'Kapadokya\'da balon turu yapmak gerçekten unutulmaz bir deneyim. Sabah erken saatlerde başlayan tur, güneşin doğuşuyla birlikte muhteşem manzaralar sunuyor. Peri bacalarının üzerinde süzülürken, tarihin derinliklerine yolculuk yapıyorsunuz. Tur sırasında profesyonel fotoğrafçılar tarafından çekilen fotoğraflar, bu özel anları ölümsüzleştiriyor. Tur sonunda geleneksel Türk kahvaltısı ile güne başlamak da ayrı bir keyif.',
        excerpt: 'Kapadokya\'da balon turu deneyimini paylaşıyoruz',
        author: 'Gezsek Travel',
        img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500',
        category: 'Seyahat Deneyimi',
        tags: ['Kapadokya', 'Balon Turu', 'Türkiye'],
        featured: true,
        readTime: 5
      },
      {
        title: 'Antalya\'nın En Güzel Plajları',
        content: 'Antalya\'nın turkuaz sularında yüzmenin keyfini çıkarın. Kekova, Kaş ve Fethiye\'nin en güzel plajlarını keşfedin. Özellikle Kekova\'daki batık şehir turu, hem tarihi hem de doğal güzellikleri bir arada sunuyor. Tekne turu sırasında mola verdiğiniz koylarda yüzme imkanı buluyorsunuz. Antalya\'nın iklimi sayesinde yılın büyük bir bölümünde deniz keyfi yaşayabilirsiniz.',
        excerpt: 'Antalya\'nın en güzel plajlarını sizler için derledik',
        author: 'Gezsek Travel',
        img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500',
        category: 'Plaj Rehberi',
        tags: ['Antalya', 'Plaj', 'Deniz'],
        featured: false,
        readTime: 8
      },
      {
        title: 'Karadeniz Yaylalarında Doğa Turu',
        content: 'Karadeniz yaylaları, doğa tutkunları için gerçek bir cennet. Uzungöl\'ün mistik atmosferi, Ayder Yaylası\'nın serin havası ve Pokut Yaylası\'nın muhteşem manzarası sizi büyüleyecek. Yayla evlerinde konaklayarak yerel kültürü yakından tanıyabilir, geleneksel Karadeniz mutfağının lezzetlerini tadabilirsiniz. Doğa yürüyüşleri sırasında endemik bitki türlerini görebilir, temiz havanın tadını çıkarabilirsiniz.',
        excerpt: 'Karadeniz yaylalarında doğa turu rehberi',
        author: 'Gezsek Travel',
        img: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=500',
        category: 'Doğa Turu',
        tags: ['Karadeniz', 'Yayla', 'Doğa'],
        featured: true,
        readTime: 6
      }
    ]);

    console.log('✅ Test verileri başarıyla oluşturuldu!');
    console.log(`👤 Admin: admin@gezsektravel.com / admin123`);
    console.log(`👤 User: user@gezsektravel.com / user123`);
    console.log(`🎯 ${tours.length} tur oluşturuldu`);
    console.log(`📝 ${blogs.length} blog yazısı oluşturuldu`);

  } catch (error) {
    console.error('❌ Seed hatası:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB bağlantısı kapatıldı');
  }
};

seedData(); 