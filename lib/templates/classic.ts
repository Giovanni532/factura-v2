export const classicTemplate = {
    id: "classic-template",
    name: "Classic",
    description: "Template classique et traditionnel pour un aspect professionnel",
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
                <div class="company-section">
                    {{#if company.logo}}
                    <div class="logo-container">
                        <img src="{{company.logo}}" alt="{{company.name}}" class="company-logo">
                    </div>
                    {{/if}}
                    <div class="company-info">
                        <h1 class="company-name">{{company.name}}</h1>
                        <div class="company-address">
                            <p>{{company.address}}</p>
                            <p>{{company.city}}, {{company.postalCode}}</p>
                            <p>{{company.country}}</p>
                        </div>
                        <div class="company-contact">
                            <p>Tél: {{company.phone}}</p>
                            <p>Email: {{company.email}}</p>
                            {{#if company.siret}}
                            <p>SIRET: {{company.siret}}</p>
                            {{/if}}
                            {{#if company.vatNumber}}
                            <p>N° TVA: {{company.vatNumber}}</p>
                            {{/if}}
                        </div>
                    </div>
                </div>
                
                <div class="invoice-title">
                    <h2>FACTURE</h2>
                    <div class="invoice-details">
                        <div class="detail-row">
                            <span class="label">Numéro:</span>
                            <span class="value">{{invoice.number}}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Date:</span>
                            <span class="value">{{invoice.issueDate}}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Échéance:</span>
                            <span class="value">{{invoice.dueDate}}</span>
                        </div>
                    </div>
                </div>
            </header>

            <div class="billing-section">
                <div class="billing-info">
                    <h3>Facturé à:</h3>
                    <div class="client-details">
                        <p class="client-name">{{client.name}}</p>
                        <p>{{client.address}}</p>
                        <p>{{client.city}}, {{client.postalCode}}</p>
                        <p>{{client.country}}</p>
                        <p>{{client.email}}</p>
                        {{#if client.siret}}
                        <p>SIRET: {{client.siret}}</p>
                        {{/if}}
                        {{#if client.vatNumber}}
                        <p>N° TVA: {{client.vatNumber}}</p>
                        {{/if}}
                    </div>
                </div>
            </div>

            <div class="items-section">
                <table class="items-table">
                    <thead>
                        <tr>
                            <th class="description-col">Description</th>
                            <th class="quantity-col">Qté</th>
                            <th class="price-col">Prix unitaire HT</th>
                            <th class="total-col">Total HT</th>
                        </tr>
                    </thead>
                    <tbody>
                        {{#each items}}
                        <tr>
                            <td>{{description}}</td>
                            <td class="center">{{quantity}}</td>
                            <td class="right">{{unitPrice}} €</td>
                            <td class="right">{{total}} €</td>
                        </tr>
                        {{/each}}
                    </tbody>
                </table>
            </div>

            <div class="totals-section">
                <table class="totals-table">
                    <tr>
                        <td class="label">Sous-total HT:</td>
                        <td class="amount">{{invoice.subtotal}} €</td>
                    </tr>
                    <tr>
                        <td class="label">TVA ({{invoice.taxRate}}%):</td>
                        <td class="amount">{{invoice.taxAmount}} €</td>
                    </tr>
                    <tr class="total-row">
                        <td class="label"><strong>Total TTC:</strong></td>
                        <td class="amount"><strong>{{invoice.total}} €</strong></td>
                    </tr>
                </table>
            </div>

            {{#if invoice.notes}}
            <div class="notes-section">
                <h4>Conditions de paiement et notes:</h4>
                <p>{{invoice.notes}}</p>
            </div>
            {{/if}}

            <footer class="invoice-footer">
                <div class="footer-line"></div>
                <p>Merci de votre confiance</p>
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
        line-height: 1.4;
        color: #000;
        background: white;
        padding: 20px;
    }

    .invoice-container {
        max-width: 800px;
        margin: 0 auto;
        background: white;
        padding: 40px;
        border: 2px solid #000;
    }

    .invoice-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 40px;
        padding-bottom: 20px;
        border-bottom: 2px solid #000;
    }

    .company-section {
        display: flex;
        gap: 20px;
        max-width: 400px;
    }

    .logo-container {
        flex-shrink: 0;
    }

    .company-logo {
        max-width: 60px;
        max-height: 60px;
        object-fit: contain;
    }

    .company-name {
        font-size: 20px;
        font-weight: bold;
        margin-bottom: 15px;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    .company-address,
    .company-contact {
        margin-bottom: 10px;
    }

    .company-address p,
    .company-contact p {
        font-size: 12px;
        margin: 2px 0;
    }

    .invoice-title {
        text-align: right;
    }

    .invoice-title h2 {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 20px;
        text-decoration: underline;
    }

    .invoice-details {
        border: 1px solid #000;
        padding: 15px;
        background: #f9f9f9;
    }

    .detail-row {
        display: flex;
        justify-content: space-between;
        margin: 5px 0;
        font-size: 14px;
    }

    .detail-row .label {
        font-weight: bold;
        width: 80px;
    }

    .detail-row .value {
        text-align: right;
    }

    .billing-section {
        margin-bottom: 30px;
    }

    .billing-info h3 {
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 10px;
        text-decoration: underline;
    }

    .client-name {
        font-weight: bold;
        font-size: 14px;
        margin-bottom: 5px;
    }

    .client-details p {
        font-size: 12px;
        margin: 2px 0;
    }

    .items-section {
        margin-bottom: 30px;
    }

    .items-table {
        width: 100%;
        border-collapse: collapse;
        border: 2px solid #000;
    }

    .items-table th {
        background: #f0f0f0;
        border: 1px solid #000;
        padding: 10px;
        text-align: left;
        font-weight: bold;
        font-size: 12px;
    }

    .items-table td {
        border: 1px solid #000;
        padding: 8px 10px;
        font-size: 12px;
    }

    .description-col {
        width: 50%;
    }

    .quantity-col {
        width: 15%;
    }

    .price-col {
        width: 17.5%;
    }

    .total-col {
        width: 17.5%;
    }

    .center {
        text-align: center;
    }

    .right {
        text-align: right;
    }

    .totals-section {
        margin-bottom: 30px;
        margin-left: auto;
        width: 300px;
    }

    .totals-table {
        width: 100%;
        border-collapse: collapse;
        border: 2px solid #000;
    }

    .totals-table td {
        border: 1px solid #000;
        padding: 8px 10px;
        font-size: 14px;
    }

    .totals-table .label {
        background: #f0f0f0;
        width: 60%;
    }

    .totals-table .amount {
        text-align: right;
        width: 40%;
    }

    .total-row {
        background: #e0e0e0;
    }

    .total-row td {
        border-top: 2px solid #000;
        font-size: 16px;
    }

    .notes-section {
        margin-bottom: 30px;
        border: 1px solid #000;
        padding: 15px;
        background: #f9f9f9;
    }

    .notes-section h4 {
        font-size: 14px;
        margin-bottom: 10px;
        text-decoration: underline;
    }

    .notes-section p {
        font-size: 12px;
        line-height: 1.4;
    }

    .invoice-footer {
        text-align: center;
        margin-top: 40px;
    }

    .footer-line {
        height: 2px;
        background: #000;
        margin-bottom: 20px;
    }

    .invoice-footer p {
        font-size: 14px;
        font-style: italic;
    }

    @media print {
        body {
            padding: 0;
        }
        
        .invoice-container {
            border: none;
            padding: 20px;
        }
    }
    `
}; 