export const modernTemplate = {
    id: "modern-template",
    name: "Modern",
    description: "Template moderne et épuré avec un design professionnel",
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
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        line-height: 1.6;
        color: #333;
        background: #f8f9fa;
        padding: 20px;
    }

    .invoice-container {
        max-width: 800px;
        margin: 0 auto;
        background: white;
        padding: 40px;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }

    .invoice-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 40px;
        padding-bottom: 20px;
        border-bottom: 3px solid #007bff;
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
        color: #007bff;
        font-size: 24px;
        margin-bottom: 10px;
    }

    .company-details p {
        margin: 2px 0;
        font-size: 14px;
    }

    .invoice-meta {
        text-align: right;
    }

    .invoice-meta h2 {
        color: #007bff;
        font-size: 28px;
        margin-bottom: 10px;
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
        background: #f8f9fa;
        border-radius: 8px;
        border-left: 4px solid #007bff;
    }

    .client-info h3 {
        color: #007bff;
        margin-bottom: 15px;
        font-size: 18px;
    }

    .client-details p {
        margin: 3px 0;
        font-size: 14px;
    }

    .items-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 30px;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .items-table th {
        background: #007bff;
        color: white;
        padding: 15px;
        text-align: left;
        font-weight: 600;
    }

    .items-table td {
        padding: 12px 15px;
        border-bottom: 1px solid #eee;
    }

    .items-table tbody tr:hover {
        background: #f8f9fa;
    }

    .totals {
        margin-left: auto;
        width: 300px;
        margin-bottom: 30px;
    }

    .totals-row {
        display: flex;
        justify-content: space-between;
        padding: 10px 0;
        border-bottom: 1px solid #eee;
    }

    .totals-row.total {
        border-top: 2px solid #007bff;
        border-bottom: none;
        font-size: 18px;
        color: #007bff;
        margin-top: 10px;
        padding-top: 15px;
    }

    .notes {
        margin-bottom: 30px;
        padding: 20px;
        background: #f8f9fa;
        border-radius: 8px;
    }

    .notes h4 {
        color: #007bff;
        margin-bottom: 10px;
    }

    .invoice-footer {
        text-align: center;
        padding-top: 20px;
        border-top: 1px solid #eee;
        color: #666;
        font-style: italic;
    }

    @media print {
        body {
            background: white;
            padding: 0;
        }
        
        .invoice-container {
            box-shadow: none;
            padding: 20px;
        }
    }
    `
}; 