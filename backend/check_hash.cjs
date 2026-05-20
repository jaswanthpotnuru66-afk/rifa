const bcrypt = require('bcryptjs');

const hash = '$2b$10$zeP4wMV3UyTQ0I7tRwWiMexLxCqxQd./6jpSBG1scBZp.uZa4Ukgu';
const candidate = 'password123';

async function check() {
    const match = await bcrypt.compare(candidate, hash);
    console.log(`Hash comparison match for "${candidate}":`, match);
}

check();
