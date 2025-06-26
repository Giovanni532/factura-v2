export const classicInvoiceTemplate = {
    id: "classic-invoice-template",
    name: "Classic - Facture",
    description: "Template classique et élégant pour vos factures",
    type: "invoice" as const,
    html: `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Facture</title>
        <style>{{CSS}}</style>
    </head>
    <body>
        <div class="invoice-container">
            <header class="invoice-header">
                <div class="company-info">
                    {{#if company.logo}}
                    <img src="{{company.logo}}" alt="{{company.name}}" class="company-logo">
                    {{/if}}
                    <div class="company-details">
                        <h1>{{company.name}}</h1>
                        <p>{{company.address}}</p>
                        <p>{{company.city}}, {{company.postalCode}}</p>
                        <p>{{company.country}}</p>
                        <p>Email: {{company.email}}</p>
                        <p>Tél: {{company.phone}}</p>
                        {{#if company.siret}}
                        <p>SIRET: {{company.siret}}</p>
                        {{/if}}
                        {{#if company.vatNumber}}
                        <p>TVA: {{company.vatNumber}}</p>
                        {{/if}}
                    </div>
                </div>
                <div class="invoice-meta">
                    <h2>FACTURE</h2>
                    <div class="invoice-number">N° {{invoice.number}}</div>
                    <div class="dates">
                        <p><strong>Date d'émission:</strong> {{invoice.issueDate}}</p>
                        <p><strong>Date d'échéance:</strong> {{invoice.dueDate}}</p>
                    </div>
                </div>
            </header>

            <div class="client-info">
                <h3>Facturé à:</h3>
                <div class="client-details">
                    <p><strong>{{client.name}}</strong></p>
                    <p>{{client.address}}</p>
                    <p>{{client.city}}, {{client.postalCode}}</p>
                    <p>{{client.country}}</p>
                    <p>{{client.email}}</p>
                    {{#if client.siret}}
                    <p>SIRET: {{client.siret}}</p>
                    {{/if}}
                </div>
            </div>

            <table class="items-table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Quantité</th>
                        <th>Prix unitaire</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {{#each items}}
                    <tr>
                        <td>{{description}}</td>
                        <td>{{quantity}}</td>
                        <td>{{unitPrice}} €</td>
                        <td>{{total}} €</td>
                    </tr>
                    {{/each}}
                </tbody>
            </table>

            <div class="totals">
                <div class="totals-row">
                    <span>Sous-total HT:</span>
                    <span>{{invoice.subtotal}} €</span>
                </div>
                <div class="totals-row">
                    <span>TVA ({{invoice.taxRate}}%):</span>
                    <span>{{invoice.taxAmount}} €</span>
                </div>
                <div class="totals-row total">
                    <span><strong>Total TTC:</strong></span>
                    <span><strong>{{invoice.total}} €</strong></span>
                </div>
            </div>

            {{#if invoice.notes}}
            <div class="notes">
                <h4>Notes:</h4>
                <p>{{invoice.notes}}</p>
            </div>
            {{/if}}

            <footer class="invoice-footer">
                <p>Merci pour votre confiance !</p>
            </footer>
        </div>
    </body>
    </html>
    `,
    css: `
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    body {
        font-family: 'Times New Roman', serif;
        line-height: 1.6;
        color: #333;
        background: #fff;
        padding: 20px;
    }

    .invoice-container {
        max-width: 800px;
        margin: 0 auto;
        background: white;
        padding: 40px;
        border: 2px solid #333;
    }

    .invoice-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 40px;
        padding-bottom: 20px;
        border-bottom: 2px solid #333;
    }

    .company-info {
        display: flex;
        gap: 20px;
    }

    .company-logo {
        max-width: 80px;
        max-height: 80px;
        object-fit: contain;
    }

    .company-details h1 {
        color: #333;
        font-size: 24px;
        margin-bottom: 10px;
        font-weight: bold;
    }

    .company-details p {
        margin: 2px 0;
        font-size: 14px;
    }

    .invoice-meta {
        text-align: right;
    }

    .invoice-meta h2 {
        color: #333;
        font-size: 28px;
        margin-bottom: 10px;
        font-weight: bold;
    }

    .invoice-number {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 15px;
        color: #333;
    }

    .dates p {
        margin: 5px 0;
        font-size: 14px;
    }

    .client-info {
        margin-bottom: 30px;
        padding: 20px;
        background: #f9f9f9;
        border: 1px solid #ddd;
    }

    .client-info h3 {
        color: #333;
        margin-bottom: 15px;
        font-size: 18px;
        font-weight: bold;
    }

    .client-details p {
        margin: 2px 0;
        font-size: 14px;
    }

    .items-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 30px;
        border: 1px solid #333;
    }

    .items-table th {
        background: #333;
        color: white;
        padding: 12px;
        text-align: left;
        font-weight: bold;
    }

    .items-table td {
        padding: 12px;
        border-bottom: 1px solid #333;
    }

    .items-table tr:nth-child(even) {
        background: #f9f9f9;
    }

    .totals {
        margin-left: auto;
        width: 300px;
    }

    .totals-row {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid #333;
    }

    .totals-row.total {
        border-top: 2px solid #333;
        border-bottom: none;
        font-size: 18px;
        margin-top: 10px;
        padding-top: 15px;
        font-weight: bold;
    }

    .notes {
        margin-top: 30px;
        padding: 20px;
        background: #f9f9f9;
        border: 1px solid #ddd;
    }

    .notes h4 {
        color: #333;
        margin-bottom: 10px;
        font-weight: bold;
    }

    .invoice-footer {
        margin-top: 40px;
        text-align: center;
        color: #666;
        font-style: italic;
        border-top: 1px solid #333;
        padding-top: 20px;
    }
    `
}; 