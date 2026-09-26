import bcrypt from "bcrypt";

const password = "admin.smp4muhammadiyahtangerang";

const hash = await bcrypt.hash(password, 10);

console.log("Password:", password);
console.log("Hash:", hash);
