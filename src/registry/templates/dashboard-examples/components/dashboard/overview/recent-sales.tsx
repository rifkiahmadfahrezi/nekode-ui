"use client";

import * as React from "react";
import { ArrowRight, MoreHorizontal } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const transactions = [
  {
    id: "INV-4031",
    customer: {
      name: "Ines Carvalho",
      email: "ines@tidepool.studio",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    },
    status: "Paid",
    date: "Nov 4",
    amount: "$1,940.00",
  },
  {
    id: "INV-4030",
    customer: {
      name: "Daniel Osei",
      email: "d.osei@kettleworks.co",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    },
    status: "Pending",
    date: "Nov 3",
    amount: "$38.50",
  },
  {
    id: "INV-4029",
    customer: {
      name: "Hana Takeda",
      email: "hana@ortho-labs.jp",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    },
    status: "Paid",
    date: "Nov 3",
    amount: "$312.00",
  },
  {
    id: "INV-4028",
    customer: {
      name: "Marcus Lindqvist",
      email: "marcus@fjordline.se",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    },
    status: "Failed",
    date: "Nov 1",
    amount: "$94.00",
  },
  {
    id: "INV-4027",
    customer: {
      name: "Priya Raman",
      email: "priya.r@lumenbay.io",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
    },
    status: "Paid",
    date: "Oct 31",
    amount: "$1,487.25",
  },
];

const statusStyles: Record<string, string> = {
  Paid: "bg-success",
  Pending: "bg-warning",
  Failed: "bg-destructive",
};

export function RecentSales() {
  return (
    <Card className="col-span-full lg:col-span-4">
      <CardHeader className="flex flex-row items-start justify-between">
        <div className="space-y-1">
          <CardTitle className="text-[15px] font-semibold tracking-tight">
            Recent transactions
          </CardTitle>
          <CardDescription className="text-[13px]">
            <span className="tabular-nums">264</span> payments this month
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 text-muted-foreground"
        >
          View all
          <ArrowRight />
        </Button>
      </CardHeader>

      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-4 text-xs font-medium text-muted-foreground">
                Customer
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">
                Status
              </TableHead>
              <TableHead className="hidden text-xs font-medium text-muted-foreground sm:table-cell">
                Date
              </TableHead>
              <TableHead className="text-right text-xs font-medium text-muted-foreground">
                Amount
              </TableHead>
              <TableHead className="w-10 pr-4">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell className="py-3 pl-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8 rounded-lg">
                      <AvatarImage
                        src={tx.customer.avatar}
                        alt={tx.customer.name}
                        className="rounded-lg"
                      />
                      <AvatarFallback className="rounded-lg">
                        {tx.customer.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid min-w-0">
                      <span className="truncate text-[13px] font-medium">
                        {tx.customer.name}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {tx.customer.email}
                      </span>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="py-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                    <span
                      className={cn(
                        "size-1.5 rounded-full",
                        statusStyles[tx.status]
                      )}
                    />
                    {tx.status}
                  </span>
                </TableCell>

                <TableCell className="hidden py-3 text-xs text-muted-foreground tabular-nums sm:table-cell">
                  {tx.date}
                </TableCell>

                <TableCell className="py-3 text-right text-[13px] font-medium tabular-nums">
                  {tx.amount}
                </TableCell>

                <TableCell className="py-3 pr-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-muted-foreground"
                          aria-label={`Actions for ${tx.id}`}
                        />
                      }
                    >
                      <MoreHorizontal />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem>View invoice</DropdownMenuItem>
                      <DropdownMenuItem>Send receipt</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        Refund
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
