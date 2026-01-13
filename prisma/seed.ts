import "dotenv/config";
import { PrismaClient, TicketStatus, TicketPriority, TicketSource } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

// Create Prisma client with pg adapter
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Default support levels with permissions
const defaultSupportLevels = [
    {
        code: "L1",
        name: "Support",
        description: "Handler pertama - masalah umum",
        sortOrder: 1,
        canViewOwnTickets: true,
        canViewTeamTickets: false,
        canViewAllTickets: false,
        canCreateTicket: true,
        canAssignTicket: false,
        canEscalateTicket: true,
        canResolveTicket: true,
        canCloseTicket: false,
    },
    {
        code: "L2",
        name: "Specialist",
        description: "Eskalasi - masalah kompleks",
        sortOrder: 2,
        canViewOwnTickets: true,
        canViewTeamTickets: true,
        canViewAllTickets: false,
        canCreateTicket: true,
        canAssignTicket: true,
        canEscalateTicket: true,
        canResolveTicket: true,
        canCloseTicket: false,
    },
    {
        code: "L3",
        name: "Expert",
        description: "Spesialis teknis/bisnis",
        sortOrder: 3,
        canViewOwnTickets: true,
        canViewTeamTickets: true,
        canViewAllTickets: true,
        canCreateTicket: true,
        canAssignTicket: true,
        canEscalateTicket: true,
        canResolveTicket: true,
        canCloseTicket: true,
    },
];

// Default users (admin and agents)
const defaultUsers = [
    {
        email: "admin@tickethub.com",
        username: "admin",
        password: "admin123", // Will be hashed
        fullName: "Admin Utama",
        role: "admin" as const,
        levelCode: "L3",
    },
    {
        email: "agent1@tickethub.com",
        username: "agent1",
        password: "agent123", // Will be hashed
        fullName: "Agent Level 1",
        role: "agent" as const,
        levelCode: "L1",
    },
    {
        email: "agent2@tickethub.com",
        username: "agent2",
        password: "agent123", // Will be hashed
        fullName: "Agent Level 2",
        role: "agent" as const,
        levelCode: "L2",
    },
    {
        email: "agent3@tickethub.com",
        username: "agent3",
        password: "agent123", // Will be hashed
        fullName: "Agent Level 3",
        role: "agent" as const,
        levelCode: "L3",
    },
];

// Default categories
const defaultCategories = [
    { name: "Akun & Akses", slug: "akun-akses", description: "Masalah login, password, dan akses akun", color: "#3B82F6", sortOrder: 0 },
    { name: "Pembayaran", slug: "pembayaran", description: "Masalah pembayaran, invoice, dan billing", color: "#22C55E", sortOrder: 1 },
    { name: "Teknis", slug: "teknis", description: "Masalah teknis, bug, dan error sistem", color: "#EF4444", sortOrder: 2 },
    { name: "Perubahan Data", slug: "perubahan-data", description: "Permintaan perubahan atau update data", color: "#F97316", sortOrder: 3 },
    { name: "Informasi", slug: "informasi", description: "Pertanyaan umum dan permintaan informasi", color: "#6366F1", sortOrder: 4 },
    { name: "Lainnya", slug: "lainnya", description: "Kategori untuk tiket yang tidak termasuk kategori di atas", color: "#6B7280", sortOrder: 5 },
];

// Sample tickets
const sampleTickets = [
    {
        ticketNumber: "TKT-241201",
        subject: "Tidak bisa login ke akun",
        description: "Saya sudah mencoba reset password berkali-kali tapi tetap tidak bisa login. Sudah dicoba dari browser berbeda juga sama saja. Mohon bantuannya.",
        status: "open" as TicketStatus,
        priority: "high" as TicketPriority,
        levelCode: "L1",
        source: "phone" as TicketSource,
        customerName: "Budi Santoso",
        customerEmail: "budi.santoso@email.com",
        customerPhone: "081234567890",
        customerCompany: "PT Maju Jaya",
        categorySlug: "akun-akses",
    },
    {
        ticketNumber: "TKT-241202",
        subject: "Pembayaran tidak tercatat",
        description: "Saya sudah transfer untuk pembayaran invoice INV-2024-001 pada tanggal 20 Desember 2024 senilai Rp 5.000.000. Namun status pembayaran masih pending. Mohon dicek.",
        status: "in_progress" as TicketStatus,
        priority: "high" as TicketPriority,
        levelCode: "L2",
        source: "email" as TicketSource,
        customerName: "Siti Rahayu",
        customerEmail: "siti.rahayu@company.co.id",
        customerPhone: "082345678901",
        categorySlug: "pembayaran",
    },
    {
        ticketNumber: "TKT-241203",
        subject: "Error saat upload dokumen",
        description: "Setiap kali saya coba upload dokumen PDF di halaman submit, selalu muncul error 'File too large' padahal ukuran file hanya 2MB. Ini sudah terjadi sejak kemarin.",
        status: "pending" as TicketStatus,
        priority: "normal" as TicketPriority,
        levelCode: "L2",
        source: "web" as TicketSource,
        customerName: "Ahmad Wijaya",
        customerEmail: "ahmad.wijaya@gmail.com",
        customerPhone: "083456789012",
        customerCompany: "CV Karya Mandiri",
        categorySlug: "teknis",
    },
    {
        ticketNumber: "TKT-241204",
        subject: "Permintaan update alamat",
        description: "Mohon update alamat pengiriman saya menjadi: Jl. Sudirman No. 123, Jakarta Selatan 12190. Terima kasih.",
        status: "resolved" as TicketStatus,
        priority: "low" as TicketPriority,
        levelCode: "L1",
        source: "walk_in" as TicketSource,
        customerName: "Dewi Lestari",
        customerEmail: "dewi.lestari@yahoo.com",
        categorySlug: "perubahan-data",
    },
    {
        ticketNumber: "TKT-241205",
        subject: "Pertanyaan tentang fitur baru",
        description: "Saya dengar ada fitur export laporan yang baru. Bagaimana cara mengaksesnya? Apakah perlu upgrade paket?",
        status: "closed" as TicketStatus,
        priority: "low" as TicketPriority,
        levelCode: "L1",
        source: "phone" as TicketSource,
        customerName: "Rudi Hermawan",
        customerEmail: "rudi.h@outlook.com",
        customerPhone: "084567890123",
        categorySlug: "informasi",
    },
    {
        ticketNumber: "TKT-241206",
        subject: "URGENT: Sistem down tidak bisa akses",
        description: "Semua staff kami tidak bisa mengakses sistem sejak pukul 09:00 pagi. Ini sangat mengganggu operasional. Mohon segera ditangani!",
        status: "in_progress" as TicketStatus,
        priority: "urgent" as TicketPriority,
        levelCode: "L3",
        source: "phone" as TicketSource,
        customerName: "Maya Indira",
        customerEmail: "maya.indira@bigcorp.com",
        customerPhone: "085678901234",
        customerCompany: "PT Big Corporation",
        categorySlug: "teknis",
    },
    {
        ticketNumber: "TKT-241207",
        subject: "Laporan salah nominal",
        description: "Laporan penjualan bulan November menampilkan total yang salah. Seharusnya Rp 150.000.000 tapi tertulis Rp 15.000.000.",
        status: "open" as TicketStatus,
        priority: "high" as TicketPriority,
        levelCode: "L2",
        source: "email" as TicketSource,
        customerName: "Andi Pratama",
        customerEmail: "andi.p@business.id",
        customerPhone: "086789012345",
        categorySlug: "teknis",
    },
    {
        ticketNumber: "TKT-241208",
        subject: "Request integrasi API",
        description: "Kami ingin mengintegrasikan sistem kami dengan API yang disediakan. Mohon informasi dokumentasi dan kredensial API.",
        status: "open" as TicketStatus,
        priority: "normal" as TicketPriority,
        levelCode: "L3",
        source: "web" as TicketSource,
        customerName: "Fajar Nugroho",
        customerEmail: "fajar.n@techstartup.io",
        customerCompany: "Tech Startup Indonesia",
        categorySlug: "informasi",
    },
];

async function main() {
    console.log("🌱 Seeding database...\n");

    // Seed Support Levels
    console.log("📊 Seeding support levels...");
    const levelMap: Record<string, string> = {};

    for (const levelData of defaultSupportLevels) {
        let level = await prisma.supportLevel.findUnique({
            where: { code: levelData.code },
        });

        if (level) {
            console.log(`   ⏭️  Skipped: ${levelData.code} - ${levelData.name} (exists)`);
        } else {
            level = await prisma.supportLevel.create({ data: levelData });
            console.log(`   ✅ Created: ${levelData.code} - ${levelData.name}`);
        }
        levelMap[levelData.code] = level.id;
    }

    // Seed Users
    console.log("\n👤 Seeding users...");
    const userMap: Record<string, string> = {};

    for (const userData of defaultUsers) {
        let user = await prisma.profile.findUnique({
            where: { email: userData.email },
        });

        if (user) {
            console.log(`   ⏭️  Skipped: ${userData.fullName} (exists)`);
        } else {
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const levelId = levelMap[userData.levelCode];
            if (!levelId) {
                console.log(`   ⚠️  Level ${userData.levelCode} not found for user ${userData.email}`);
                continue;
            }
            user = await prisma.profile.create({
                data: {
                    email: userData.email,
                    username: userData.username,
                    password: hashedPassword,
                    fullName: userData.fullName,
                    role: userData.role,
                    levelId,
                },
            });
            console.log(`   ✅ Created: ${userData.fullName} (${userData.email})`);
        }
        userMap[userData.username] = user.id;
    }

    // Seed Categories
    console.log("\n📁 Seeding categories...");
    const categoryMap: Record<string, string> = {};

    for (const category of defaultCategories) {
        let cat = await prisma.category.findUnique({
            where: { slug: category.slug },
        });

        if (cat) {
            console.log(`   ⏭️  Skipped: ${category.name} (exists)`);
        } else {
            cat = await prisma.category.create({ data: category });
            console.log(`   ✅ Created: ${category.name}`);
        }
        categoryMap[category.slug] = cat.id;
    }

    // Get admin user for createdBy
    console.log("\n👤 Looking for admin user...");
    const admin = await prisma.profile.findFirst({
        where: { role: "admin" },
    });

    if (!admin) {
        console.log("   ⚠️  No admin user found. Skipping ticket seeding.");
        console.log("\n✨ Categories seeded successfully!");
        return;
    }

    console.log(`   ✅ Found admin: ${admin.fullName || admin.email}`);

    // Seed Tickets
    console.log("\n🎫 Seeding tickets...");

    for (const ticketData of sampleTickets) {
        const existing = await prisma.ticket.findUnique({
            where: { ticketNumber: ticketData.ticketNumber },
        });

        if (existing) {
            console.log(`   ⏭️  Skipped: ${ticketData.ticketNumber} (exists)`);
            continue;
        }

        const { categorySlug, levelCode, ...rest } = ticketData;
        const categoryId = categoryMap[categorySlug];
        const levelId = levelMap[levelCode];

        if (!levelId) {
            console.log(`   ⚠️  Level ${levelCode} not found for ticket ${ticketData.ticketNumber}`);
            continue;
        }

        const ticket = await prisma.ticket.create({
            data: {
                ...rest,
                categoryId,
                levelId,
                createdById: admin.id,
                assigneeId: ticketData.status !== "open" ? admin.id : null,
                resolvedAt: ticketData.status === "resolved" || ticketData.status === "closed"
                    ? new Date(Date.now() - 1000 * 60 * 60) // 1 hour ago
                    : null,
                closedAt: ticketData.status === "closed"
                    ? new Date(Date.now() - 1000 * 60 * 30) // 30 min ago
                    : null,
            },
        });

        // Create initial activity
        await prisma.ticketActivity.create({
            data: {
                ticketId: ticket.id,
                authorId: admin.id,
                type: "created",
                description: `Tiket dibuat oleh ${admin.fullName || admin.email}`,
            },
        });

        // Add sample reply for in_progress tickets
        if (ticketData.status === "in_progress" || ticketData.status === "resolved") {
            await prisma.ticketReply.create({
                data: {
                    ticketId: ticket.id,
                    authorId: admin.id,
                    message: "Terima kasih atas laporannya. Kami sedang memproses permintaan Anda dan akan segera memberikan update.",
                },
            });
        }

        console.log(`   ✅ Created: ${ticketData.ticketNumber} - ${ticketData.subject.substring(0, 40)}...`);
    }

    console.log("\n✨ Seeding completed!");
}

main()
    .catch((e) => {
        console.error("❌ Seeding failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await pool.end();
        await prisma.$disconnect();
    });

