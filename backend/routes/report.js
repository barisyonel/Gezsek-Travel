const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const User = require('../models/User');
const Tour = require('../models/Tour');
const Purchase = require('../models/Purchase');
const Review = require('../models/Review');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const InstagramTour = require('../models/InstagramTour');
const auth = require('../middleware/auth');
const { sendEmail } = require('../services/emailService');

// Get all reports (admin)
router.get('/admin', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      category,
      status,
      search,
      createdBy
    } = req.query;

    let query = { isDeleted: false };

    // Filters
    if (type) query.type = type;
    if (category) query.category = category;
    if (status) query.status = status;
    if (createdBy) query.createdBy = createdBy;

    // Search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const reports = await Report.find(query)
      .populate('createdBy', 'name email')
      .populate('permissions.viewAccess', 'name email')
      .populate('permissions.editAccess', 'name email')
      .populate('schedule.recipients', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Report.countDocuments(query);

    res.json({
      reports,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ message: 'Raporlar alınırken hata oluştu' });
  }
});

// Get report by ID (admin)
router.get('/admin/:id', auth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('permissions.viewAccess', 'name email')
      .populate('permissions.editAccess', 'name email')
      .populate('schedule.recipients', 'name email');

    if (!report) {
      return res.status(404).json({ message: 'Rapor bulunamadı' });
    }

    res.json(report);
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({ message: 'Rapor alınırken hata oluştu' });
  }
});

// Create report (admin)
router.post('/admin', auth, async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      category,
      dataSource,
      visualization,
      schedule,
      permissions,
      tags
    } = req.body;

    // Validation
    if (!title || !type || !category) {
      return res.status(400).json({ 
        message: 'Başlık, tür ve kategori alanları zorunludur' 
      });
    }

    const reportData = {
      title,
      description,
      type,
      category,
      createdBy: req.user._id,
      dataSource: dataSource || {},
      visualization: visualization || {},
      schedule: schedule || {},
      permissions: permissions || {},
      tags: tags || []
    };

    const report = new Report(reportData);
    await report.save();

    const populatedReport = await Report.findById(report._id)
      .populate('createdBy', 'name email')
      .populate('permissions.viewAccess', 'name email')
      .populate('permissions.editAccess', 'name email')
      .populate('schedule.recipients', 'name email');

    res.status(201).json(populatedReport);
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({ message: 'Rapor oluşturulurken hata oluştu' });
  }
});

// Update report (admin)
router.put('/admin/:id', auth, async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('createdBy', 'name email')
    .populate('permissions.viewAccess', 'name email')
    .populate('permissions.editAccess', 'name email')
    .populate('schedule.recipients', 'name email');

    if (!report) {
      return res.status(404).json({ message: 'Rapor bulunamadı' });
    }

    res.json(report);
  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({ message: 'Rapor güncellenirken hata oluştu' });
  }
});

// Delete report (admin)
router.delete('/admin/:id', auth, async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({ message: 'Rapor bulunamadı' });
    }

    res.json({ message: 'Rapor silindi' });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({ message: 'Rapor silinirken hata oluştu' });
  }
});

// Generate report (admin)
router.post('/admin/:id/generate', auth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Rapor bulunamadı' });
    }

    const startTime = Date.now();
    const results = await generateReportData(report);
    const generationTime = Date.now() - startTime;

    // Update report with results
    report.results = {
      lastGenerated: new Date(),
      data: results.data,
      summary: results.summary,
      metadata: {
        generationTime,
        dataSource: report.dataSource.collections.join(', '),
        filters: report.dataSource.filters
      }
    };

    await report.save();

    const updatedReport = await Report.findById(report._id)
      .populate('createdBy', 'name email')
      .populate('permissions.viewAccess', 'name email')
      .populate('permissions.editAccess', 'name email')
      .populate('schedule.recipients', 'name email');

    res.json(updatedReport);
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({ message: 'Rapor oluşturulurken hata oluştu' });
  }
});

// Export report (admin)
router.post('/admin/:id/export', auth, async (req, res) => {
  try {
    const { format = 'pdf' } = req.body;
    
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Rapor bulunamadı' });
    }

    // Generate export data
    const exportData = await generateExportData(report, format);
    
    // Update report export info
    report.export.lastExport = {
      date: new Date(),
      format,
      fileUrl: exportData.fileUrl
    };

    await report.save();

    res.json({
      message: 'Rapor başarıyla dışa aktarıldı',
      fileUrl: exportData.fileUrl,
      format
    });
  } catch (error) {
    console.error('Export report error:', error);
    res.status(500).json({ message: 'Rapor dışa aktarılırken hata oluştu' });
  }
});

// Get report analytics (admin)
router.get('/admin/analytics/overview', auth, async (req, res) => {
  try {
    const totalReports = await Report.countDocuments({ isDeleted: false });
    const activeReports = await Report.countDocuments({ 
      status: 'active',
      isDeleted: false 
    });
    const scheduledReports = await Report.countDocuments({ 
      'schedule.isScheduled': true,
      isDeleted: false 
    });
    const overdueReports = await Report.countDocuments({ 
      'schedule.isScheduled': true,
      'schedule.nextRun': { $lt: new Date() },
      isDeleted: false 
    });

    // Type distribution
    const typeStats = await Report.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    // Category distribution
    const categoryStats = await Report.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Status distribution
    const statusStats = await Report.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentReports = await Report.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
      isDeleted: false
    });

    // Recently generated reports
    const recentlyGenerated = await Report.countDocuments({
      'results.lastGenerated': { $gte: sevenDaysAgo },
      isDeleted: false
    });

    res.json({
      totalReports,
      activeReports,
      scheduledReports,
      overdueReports,
      recentReports,
      recentlyGenerated,
      typeStats,
      categoryStats,
      statusStats
    });
  } catch (error) {
    console.error('Report analytics error:', error);
    res.status(500).json({ message: 'Analitik veriler alınırken hata oluştu' });
  }
});

// Get available data sources (admin)
router.get('/admin/data-sources', auth, async (req, res) => {
  try {
    const dataSources = {
      users: {
        name: 'Kullanıcılar',
        description: 'Kullanıcı kayıtları ve profilleri',
        fields: ['_id', 'name', 'email', 'createdAt', 'isActive', 'role'],
        count: await User.countDocuments()
      },
      tours: {
        name: 'Turlar',
        description: 'Tur bilgileri ve detayları',
        fields: ['_id', 'title', 'price', 'category', 'duration', 'createdAt', 'isActive'],
        count: await Tour.countDocuments()
      },
      purchases: {
        name: 'Satın Almalar',
        description: 'Rezervasyon ve ödeme kayıtları',
        fields: ['_id', 'tourId', 'userId', 'totalPrice', 'status', 'createdAt'],
        count: await Purchase.countDocuments()
      },
      reviews: {
        name: 'Yorumlar',
        description: 'Kullanıcı yorumları ve değerlendirmeleri',
        fields: ['_id', 'tourId', 'userId', 'rating', 'comment', 'createdAt'],
        count: await Review.countDocuments()
      },
      messages: {
        name: 'Mesajlar',
        description: 'Müşteri mesajları ve iletişim kayıtları',
        fields: ['_id', 'name', 'email', 'subject', 'status', 'createdAt'],
        count: await Message.countDocuments()
      },
      notifications: {
        name: 'Bildirimler',
        description: 'Sistem bildirimleri ve duyurular',
        fields: ['_id', 'recipient', 'title', 'type', 'status', 'createdAt'],
        count: await Notification.countDocuments()
      },
      instagramTours: {
        name: 'Instagram Turları',
        description: 'Instagram tur paylaşımları',
        fields: ['_id', 'title', 'category', 'likes', 'comments', 'createdAt'],
        count: await InstagramTour.countDocuments()
      }
    };

    res.json(dataSources);
  } catch (error) {
    console.error('Get data sources error:', error);
    res.status(500).json({ message: 'Veri kaynakları alınırken hata oluştu' });
  }
});

// Process scheduled reports (admin)
router.post('/admin/process-scheduled', auth, async (req, res) => {
  try {
    const now = new Date();
    const scheduledReports = await Report.find({
      'schedule.isScheduled': true,
      'schedule.nextRun': { $lte: now },
      isDeleted: false
    }).populate('schedule.recipients', 'name email');

    let processedCount = 0;
    for (const report of scheduledReports) {
      try {
        // Generate report
        const results = await generateReportData(report);
        
        // Update report
        report.results = {
          lastGenerated: new Date(),
          data: results.data,
          summary: results.summary,
          metadata: {
            generationTime: 0,
            dataSource: report.dataSource.collections.join(', '),
            filters: report.dataSource.filters
          }
        };

        // Update next run time
        const nextRun = new Date(now);
        switch (report.schedule.frequency) {
          case 'daily':
            nextRun.setDate(nextRun.getDate() + 1);
            break;
          case 'weekly':
            nextRun.setDate(nextRun.getDate() + 7);
            break;
          case 'monthly':
            nextRun.setMonth(nextRun.getMonth() + 1);
            break;
          case 'quarterly':
            nextRun.setMonth(nextRun.getMonth() + 3);
            break;
          case 'yearly':
            nextRun.setFullYear(nextRun.getFullYear() + 1);
            break;
        }
        report.schedule.nextRun = nextRun;

        await report.save();

        // Send email if configured
        if (report.schedule.deliveryMethod === 'email' && report.schedule.recipients.length > 0) {
          for (const recipient of report.schedule.recipients) {
            try {
              await sendEmail({
                to: recipient.email,
                subject: `Rapor: ${report.title}`,
                template: 'scheduledReport',
                context: {
                  recipientName: recipient.name,
                  reportTitle: report.title,
                  reportSummary: results.summary,
                  nextRun: nextRun.toLocaleDateString('tr-TR')
                }
              });
            } catch (emailError) {
              console.error(`Email error for ${recipient.email}:`, emailError);
            }
          }
        }

        processedCount++;
      } catch (error) {
        console.error(`Error processing report ${report._id}:`, error);
      }
    }

    res.json({ 
      message: `${processedCount} planlanmış rapor işlendi`,
      processedCount
    });
  } catch (error) {
    console.error('Process scheduled reports error:', error);
    res.status(500).json({ message: 'Planlanmış raporlar işlenirken hata oluştu' });
  }
});

// Helper function to generate report data
async function generateReportData(report) {
  const { collections, filters, aggregation } = report.dataSource;
  
  let pipeline = [];
  
  // Add date range filter
  if (filters.dateRange) {
    pipeline.push({
      $match: {
        createdAt: {
          $gte: new Date(filters.dateRange.start),
          $lte: new Date(filters.dateRange.end)
        }
      }
    });
  }

  // Add status filter
  if (filters.status && filters.status.length > 0) {
    pipeline.push({
      $match: { status: { $in: filters.status } }
    });
  }

  // Add category filter
  if (filters.categories && filters.categories.length > 0) {
    pipeline.push({
      $match: { category: { $in: filters.categories } }
    });
  }

  // Add aggregation
  if (aggregation.groupBy && aggregation.groupBy.length > 0) {
    const groupStage = { _id: {} };
    
    aggregation.groupBy.forEach(field => {
      groupStage._id[field] = `$${field}`;
    });

    aggregation.metrics.forEach(metric => {
      groupStage[metric.alias] = { [`$${metric.operation}`]: `$${metric.field}` };
    });

    pipeline.push({ $group: groupStage });
  }

  // Add sort
  if (aggregation.sort && aggregation.sort.length > 0) {
    const sortStage = {};
    aggregation.sort.forEach(sortItem => {
      sortStage[sortItem.field] = sortItem.order === 'desc' ? -1 : 1;
    });
    pipeline.push({ $sort: sortStage });
  }

  // Add limit
  if (aggregation.limit) {
    pipeline.push({ $limit: aggregation.limit });
  }

  // Execute aggregation based on collection
  let data = [];
  let summary = {};

  for (const collection of collections) {
    let Model;
    switch (collection) {
      case 'users':
        Model = User;
        break;
      case 'tours':
        Model = Tour;
        break;
      case 'purchases':
        Model = Purchase;
        break;
      case 'reviews':
        Model = Review;
        break;
      case 'messages':
        Model = Message;
        break;
      case 'notifications':
        Model = Notification;
        break;
      case 'instagramTours':
        Model = InstagramTour;
        break;
      default:
        continue;
    }

    const result = await Model.aggregate(pipeline);
    data = data.concat(result);
  }

  // Calculate summary
  if (data.length > 0) {
    const numericFields = aggregation.metrics
      .filter(m => ['sum', 'avg', 'min', 'max'].includes(m.operation))
      .map(m => m.alias);

    summary = {
      totalRecords: data.length,
      totalValue: numericFields.reduce((sum, field) => sum + (data[0][field] || 0), 0),
      averageValue: numericFields.length > 0 ? numericFields.reduce((sum, field) => sum + (data[0][field] || 0), 0) / numericFields.length : 0,
      minValue: Math.min(...numericFields.map(field => data[0][field] || 0)),
      maxValue: Math.max(...numericFields.map(field => data[0][field] || 0)),
      recordCount: data.length
    };
  }

  return { data, summary };
}

// Helper function to generate export data
async function generateExportData(report, format) {
  // This is a placeholder for actual export generation
  // In a real implementation, you would use libraries like:
  // - PDF: puppeteer, jsPDF
  // - Excel: exceljs, xlsx
  // - CSV: json2csv
  
  const fileName = `${report.title.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.${format}`;
  const fileUrl = `/exports/${fileName}`;
  
  return { fileUrl };
}

module.exports = router; 