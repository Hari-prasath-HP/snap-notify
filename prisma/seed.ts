import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

async function main() {

  const hashedPassword = await bcrypt.hash("123456", 10)

  await prisma.user.create({
    data: {
      name: "Product Owner",
      email: "owner@test.com",
      password: hashedPassword,
      role: "product_owner"
    }
  })

  console.log("Product Owner created")
}

main()
  .catch((e) => {
    console.error(e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })