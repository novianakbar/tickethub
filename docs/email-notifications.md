# Email Notification System - TicketHub

Dokumentasi sistem notifikasi email untuk TicketHub.

## Daftar Email Templates

### Customer Notifications

| # | Template Code | Event | Deskripsi | File |
|---|---------------|-------|-----------|------|
| 1 | `TICKET_CREATED` | Ticket Created | Konfirmasi ticket berhasil dibuat + nomor ticket | [ticket-created.html](./email-templates/ticket-created.html) |
| 2 | `TICKET_ASSIGNED` | Ticket Assigned | Info ticket sudah ditangani agent | [ticket-assigned.html](./email-templates/ticket-assigned.html) |
| 3 | `TICKET_STATUS_CHANGED` | Status Changed | Update perubahan status ticket | [ticket-status-changed.html](./email-templates/ticket-status-changed.html) |
| 4 | `TICKET_NEW_REPLY` | New Reply | Agent membalas/menambah komentar | [ticket-new-reply.html](./email-templates/ticket-new-reply.html) |
| 5 | `TICKET_RESOLVED` | Ticket Resolved | Ticket sudah diselesaikan | [ticket-resolved.html](./email-templates/ticket-resolved.html) |
| 6 | `TICKET_CLOSED` | Ticket Closed | Konfirmasi ticket ditutup | [ticket-closed.html](./email-templates/ticket-closed.html) |

### Agent Notifications

| # | Template Code | Event | Penerima | Deskripsi | File |
|---|---------------|-------|----------|-----------|------|
| 1 | `AGENT_TICKET_ASSIGNED` | Ticket Assigned | Agent yang di-assign | Ada ticket baru yang di-assign | [agent-ticket-assigned.html](./email-templates/agent-ticket-assigned.html) |
| 2 | `AGENT_CUSTOMER_REPLY` | Customer Reply | Agent yang menangani | Customer membalas ticket | [agent-customer-reply.html](./email-templates/agent-customer-reply.html) |
| 3 | `AGENT_SLA_WARNING` | SLA Warning | Agent yang menangani | Peringatan batas waktu SLA | [agent-sla-warning.html](./email-templates/agent-sla-warning.html) |
| 4 | `AGENT_TICKET_PROGRESS` | Ticket Progress | Agent pembuat ticket | Update progress ticket | [agent-ticket-progress.html](./email-templates/agent-ticket-progress.html) |

---

## Template Variables

### Global Variables
| Variable | Deskripsi |
|----------|-----------|
| `{{APP_NAME}}` | Nama aplikasi (TicketHub) |
| `{{COMPANY_NAME}}` | Nama perusahaan |
| `{{SUPPORT_EMAIL}}` | Email support |
| `{{CURRENT_YEAR}}` | Tahun saat ini |

### Ticket Variables
| Variable | Deskripsi |
|----------|-----------|
| `{{TICKET_NUMBER}}` | Nomor ticket (e.g., TKT-2024-0001) |
| `{{TICKET_SUBJECT}}` | Judul ticket |
| `{{TICKET_DESCRIPTION}}` | Deskripsi ticket |
| `{{TICKET_STATUS}}` | Status ticket |
| `{{TICKET_PRIORITY}}` | Prioritas ticket |
| `{{TICKET_CATEGORY}}` | Kategori ticket |
| `{{TICKET_URL}}` | URL untuk melihat ticket |
| `{{CREATED_AT}}` | Tanggal pembuatan ticket |

### User Variables
| Variable | Deskripsi |
|----------|-----------|
| `{{CUSTOMER_NAME}}` | Nama customer |
| `{{CUSTOMER_EMAIL}}` | Email customer |
| `{{AGENT_NAME}}` | Nama agent yang menangani |

### Reply Variables
| Variable | Deskripsi |
|----------|-----------|
| `{{REPLY_CONTENT}}` | Isi balasan |
| `{{REPLY_DATE}}` | Tanggal balasan |
| `{{REPLY_BY}}` | Nama pengirim balasan |

### SLA Variables
| Variable | Deskripsi |
|----------|-----------|
| `{{SLA_DEADLINE}}` | Batas waktu SLA |
| `{{TIME_REMAINING}}` | Sisa waktu |

---

## Theming

Email templates menggunakan tema **Merah Putih** (Red & White) yang konsisten dengan aplikasi TicketHub:

- **Primary Color**: `#dc2626` (Red)
- **Primary Dark**: `#b91c1c`
- **Background**: `#ffffff`
- **Text Primary**: `#1f2937`
- **Text Secondary**: `#6b7280`
- **Border**: `#e5e7eb`
- **Success**: `#16a34a`
- **Warning**: `#f59e0b`
- **Info**: `#3b82f6`

---

## Usage

Implementasi pengiriman email dapat dilakukan dengan:

1. Load template HTML dari file
2. Replace semua variables dengan nilai aktual
3. Kirim via SMTP yang sudah dikonfigurasi


