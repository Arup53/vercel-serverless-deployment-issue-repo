import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";

import prisma from "../lib/prisma";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req: Request, res: Response) => {
  res.send("hello there");
});

app.get("/allusers", async (req, res) => {
  const users = await prisma.user.findMany({
    include: {
      transactions: true,
      cardDetails: true,
      invoices: true,
    },
  });

  const result = users.map((user) => {
    const totalAmount = user.transactions.reduce((sum, tx) => {
      return sum + parseFloat(tx.amount.toString());
    }, 0);

    const totalInvoiceExpense = user.invoices.reduce((sum, invoice) => {
      return sum + invoice.total;
    }, 0);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      totalTransactionAmount: totalAmount,
      cardStatus: user.cardDetails?.status ?? "not applied",
      cardHolderId: user.cardDetails?.cardholder_Id,
      cardId: user.cardDetails?.card_id,
      invoiceExpense: totalInvoiceExpense,
    };
  });

  res.json(result);
});

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
