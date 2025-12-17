# GST Billing Application

A professional Vue 3 web application for Indian GST billing and invoice management. Built with modern technologies and designed with a clean, CA-friendly interface similar to Tally/Zoho Books.

## Features

- **Company Setup**: Configure company details, GSTIN, and bank information
- **Product Master**: Manage products with HSN/SAC codes, GST rates, and pricing
- **Customer Master**: Manage B2B and B2C customers with GSTIN validation
- **Invoice Management**: Create, edit, and finalize GST-compliant invoices
- **Tax Calculation**: Backend-powered GST calculations (CGST/SGST for intra-state, IGST for inter-state)
- **Invoice Preview**: Professional invoice preview with print support
- **PDF Download**: Download finalized invoices as PDF

## Tech Stack

- **Frontend**: Vue 3 with Composition API
- **Build Tool**: Vite
- **State Management**: Pinia
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Routing**: Vue Router

## Project Structure

```
src/
├── api/                  # API service layer
│   ├── client.js         # Axios client configuration
│   ├── company.js        # Company API endpoints
│   ├── customers.js      # Customer API endpoints
│   ├── invoices.js       # Invoice API endpoints
│   └── products.js       # Product API endpoints
├── assets/
│   └── main.css          # Global styles and Tailwind
├── components/           # Reusable UI components
│   ├── ConfirmDialog.vue
│   ├── DataTable.vue
│   ├── FormInput.vue
│   ├── FormSelect.vue
│   ├── FormTextarea.vue
│   ├── LoadingSpinner.vue
│   ├── Modal.vue
│   ├── PageHeader.vue
│   ├── StatusBadge.vue
│   └── ToastContainer.vue
├── composables/          # Vue composables (shared logic)
├── layouts/
│   └── MainLayout.vue    # Main application layout with sidebar
├── pages/                # Page components
│   ├── CompanySetup.vue
│   ├── CustomerMaster.vue
│   ├── InvoiceForm.vue
│   ├── InvoiceList.vue
│   ├── InvoicePreview.vue
│   └── ProductMaster.vue
├── router/
│   └── index.js          # Vue Router configuration
├── stores/               # Pinia stores
│   ├── company.js
│   ├── customers.js
│   ├── invoices.js
│   ├── products.js
│   └── toast.js
├── utils/                # Utility functions
│   ├── formatters.js     # Currency, date, number formatting
│   └── validators.js     # Form validation helpers
├── App.vue
└── main.js
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- FastAPI backend running on port 8000

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd gst-billing-app

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

## API Endpoints

The application expects the following FastAPI backend endpoints:

### Company
- `GET /masters/company` - Get company details
- `POST /masters/company` - Create company
- `PUT /masters/company` - Update company

### Products
- `GET /masters/products` - List all products
- `POST /masters/products` - Create product
- `PUT /masters/products/{id}` - Update product
- `PATCH /masters/products/{id}/status` - Toggle product status

### Customers
- `GET /masters/customers` - List all customers
- `POST /masters/customers` - Create customer
- `PUT /masters/customers/{id}` - Update customer
- `PATCH /masters/customers/{id}/status` - Toggle customer status

### Invoices
- `GET /billing/invoices` - List all invoices
- `GET /billing/invoices/{id}` - Get invoice details
- `POST /billing/invoices` - Create invoice
- `PUT /billing/invoices/{id}` - Update invoice
- `POST /billing/invoices/{id}/items` - Add item to invoice
- `PUT /billing/invoices/{id}/items/{item_id}` - Update invoice item
- `DELETE /billing/invoices/{id}/items/{item_id}` - Remove invoice item
- `POST /billing/invoices/{id}/finalize` - Finalize invoice

### Tax
- `POST /tax/calculate` - Calculate GST for invoice

### Documents
- `GET /documents/invoices/{id}/preview` - Get invoice preview data
- `GET /documents/invoices/{id}/pdf` - Download invoice PDF

## Design Principles

1. **No Frontend Calculations**: All GST calculations happen on the backend
2. **Read-only Finalized Invoices**: Once finalized, invoices cannot be edited
3. **Backend-driven Values**: Tax amounts are always displayed from backend responses
4. **Clean Professional UI**: Tally/Zoho Books inspired design
5. **Desktop-first**: Optimized for desktop usage

## Indian GST Compliance

- Supports all Indian states with GST codes (01-38)
- GSTIN validation with checksum
- Automatic state detection from GSTIN
- Intra-state (CGST + SGST) and Inter-state (IGST) tax handling
- HSN/SAC code support
- Standard GST rates: 0%, 0.25%, 3%, 5%, 12%, 18%, 28%

## License

MIT
