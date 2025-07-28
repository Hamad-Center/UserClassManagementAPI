import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await prisma.userClassAssignment.deleteMany();
    await prisma.user.deleteMany();
    await prisma.class.deleteMany();

    console.log('🗑️  Cleared existing data');

    // Create users
    const users = await Promise.all([
        prisma.user.create({
            data: {
                firstName: 'Admin',
                lastName: 'User',
                email: 'admin@example.com',
                password: await bcrypt.hash('admin123', 10),
                phoneNumber: '+1234567890',
                department: 'IT',
                roles: ['ADMIN'],
            }
        }),
        prisma.user.create({
            data: {
                firstName: 'Engineer',
                lastName: 'User',
                email: 'engineer@example.com',
                password: await bcrypt.hash('engineer123', 10),
                phoneNumber: '+1234567891',
                department: 'Engineering',
                roles: ['ENGINEER'],
            }
        }),
        prisma.user.create({
            data: {
                firstName: 'Intern',
                lastName: 'User',
                email: 'intern@example.com',
                password: await bcrypt.hash('intern123', 10),
                phoneNumber: '+1234567892',
                department: 'Internship',
                roles: ['INTERN'],
            }
        }),
        prisma.user.create({
            data: {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                password: await bcrypt.hash('password123', 10),
                phoneNumber: '+1234567893',
                department: 'Marketing',
                roles: ['USER'],
            }
        }),
        prisma.user.create({
            data: {
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane.smith@example.com',
                password: await bcrypt.hash('password123', 10),
                phoneNumber: '+1234567894',
                department: 'Sales',
                roles: ['USER'],
            }
        }),
    ]);

    console.log('👥 Created users:', users.length);

    // Create classes
    const classes = await Promise.all([
        prisma.class.create({
            data: {
                name: 'Hand to Hand Combat Sessions',
                capacity: 25,
                description: 'This is hardcore training for advanced combat techniques.',
            },
        }),
        prisma.class.create({
            data: {
                name: 'Advanced NestJS Development',
                capacity: 30,
                description: 'Learn advanced NestJS patterns and microservices architecture.',
            },
        }),
        prisma.class.create({
            data: {
                name: 'Database Design Principles',
                capacity: 20,
                description: 'Master database design, normalization, and optimization.',
            },
        }),
        prisma.class.create({
            data: {
                name: 'API Security Best Practices',
                capacity: 15,
                description: 'Learn authentication, authorization, and security patterns.',
            },
        }),
        prisma.class.create({
            data: {
                name: 'Docker and Containerization',
                capacity: 18,
                description: 'Containerize applications with Docker and Kubernetes.',
            },
        }),
    ]);

    console.log('🏫 Created classes:', classes.length);

    // Create user-class assignments
    const assignments = await Promise.all([
        prisma.userClassAssignment.create({
            data: {
                userId: users[0].id, // Admin user
                classId: classes[0].id, // Combat class
                status: 'ACTIVE',
            },
        }),
        prisma.userClassAssignment.create({
            data: {
                userId: users[1].id, // Engineer user
                classId: classes[1].id, // NestJS class
                status: 'ACTIVE',
            },
        }),
        prisma.userClassAssignment.create({
            data: {
                userId: users[2].id, // Intern user
                classId: classes[2].id, // Database class
                status: 'ACTIVE',
            },
        }),
        prisma.userClassAssignment.create({
            data: {
                userId: users[3].id, // John Doe
                classId: classes[3].id, // Security class
                status: 'ACTIVE',
            },
        }),
        prisma.userClassAssignment.create({
            data: {
                userId: users[4].id, // Jane Smith
                classId: classes[4].id, // Docker class
                status: 'ACTIVE',
            },
        }),
        // Additional assignments for testing
        prisma.userClassAssignment.create({
            data: {
                userId: users[0].id, // Admin also in NestJS class
                classId: classes[1].id,
                status: 'ACTIVE',
            },
        }),
        prisma.userClassAssignment.create({
            data: {
                userId: users[1].id, // Engineer also in Security class
                classId: classes[3].id,
                status: 'ACTIVE',
            },
        }),
    ]);

    console.log('🔗 Created assignments:', assignments.length);

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users: ${users.length}`);
    console.log(`   Classes: ${classes.length}`);
    console.log(`   Assignments: ${assignments.length}`);
    console.log('\n🔑 Default login credentials:');
    console.log('   Admin: admin@example.com / admin123');
    console.log('   Engineer: engineer@example.com / engineer123');
    console.log('   Intern: intern@example.com / intern123');
    console.log('   User: john.doe@example.com / password123');
    console.log('   User: jane.smith@example.com / password123');
}

main()
    .catch((e) => {
        console.error('❌ Error during seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    }); 