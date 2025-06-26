export const minimalInvoiceTemplate = {
    id: "minimal-invoice-template",
    name: "Minimal - Facture",
    description: "Template minimaliste et épuré pour vos factures",
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
                    <h1>{{company.name}}</h1>
                    <p>{{company.address}}</p>
                    <p>{{company.city}}, {{company.postalCode}}</p>
                    <p>{{company.country}}</p>
                    <p>{{company.email}}</p>
                    <p>{{company.phone}}</p>
                    {{#if company.siret}}
                    <p>SIRET: {{company.siret}}</p>
                    {{/if}}
                    {{#if company.vatNumber}}
                    <p>TVA: {{company.vatNumber}}</p>
                    {{/if}}
                </div>
                <div class="invoice-meta">
                    <h2>FACTURE</h2>
                    <p class="invoice-number">N° {{invoice.number}}</p>
                    <p><strong>Date d'émission:</strong> {{invoice.issueDate}}</p>
                    <p><strong>Date d'échéance:</strong> {{invoice.dueDate}}</p>
                </div>
            </header>

            <div class="client-info">
                <h3>Facturé à:</h3>
                <p><strong>{{client.name}}</strong></p>
                <p>{{client.address}}</p>
                <p>{{client.city}}, {{client.postalCode}}</p>
                <p>{{client.country}}</p>
                <p>{{client.email}}</p>
                {{#if client.siret}}
                <p>SIRET: {{client.siret}}</p>
                {{/if}}
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
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.6;
        color: #333;
        background: #fff;
        padding: 40px;
    }

    .invoice-container {
        max-width: 800px;
        margin: 0 auto;
    }

    .invoice-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 60px;
        padding-bottom: 30px;
        border-bottom: 1px solid #e0e0e0;
    }

    .company-info h1 {
        font-size: 24px;
        font-weight: 600;
        margin-bottom: 20px;
        color: #333;
    }

    .company-info p {
        margin: 5px 0;
        font-size: 14px;
        color: #666;
    }

    .invoice-meta {
        text-align: right;
    }

    .invoice-meta h2 {
        font-size: 32px;
        font-weight: 300;
        margin-bottom: 20px;
        color: #333;
    }

    .invoice-number {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 15px;
        color: #333;
    }

    .invoice-meta p {
        margin: 5px 0;
        font-size: 14px;
        color: #666;
    }

    .client-info {
        margin-bottom: 50px;
    }

    .client-info h3 {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 15px;
        color: #333;
    }

    .client-info p {
        margin: 5px 0;
        font-size: 14px;
        color: #666;
    }

    .items-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 50px;
    }

    .items-table th {
        padding: 15px 0;
        text-align: left;
        font-weight: 600;
        font-size: 14px;
        color: #333;
        border-bottom: 2px solid #e0e0e0;
    }

    .items-table td {
        padding: 15px 0;
        font-size: 14px;
        color: #666;
        border-bottom: 1px solid #f0f0f0;
    }

    .totals {
        margin-left: auto;
        width: 300px;
    }

    .totals-row {
        display: flex;
        justify-content: space-between;
        padding: 10px 0;
        font-size: 14px;
        color: #666;
    }

    .totals-row.total {
        font-size: 18px;
        font-weight: 600;
        color: #333;
        border-top: 2px solid #e0e0e0;
        margin-top: 10px;
        padding-top: 20px;
    }

    .notes {
        margin-top: 50px;
        padding-top: 30px;
        border-top: 1px solid #e0e0e0;
    }

    .notes h4 {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 15px;
        color: #333;
    }

    .notes p {
        font-size: 14px;
        color: #666;
        line-height: 1.6;
    }

    .invoice-footer {
        margin-top: 60px;
        text-align: center;
        color: #999;
        font-size: 14px;
    }
    `
}; 