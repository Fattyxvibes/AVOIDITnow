# Boycott Alternatives Database Structure

## Summary

**Rows:** 7

### Columns

- `Boycott product alternatives database`
- `Value`

### Sample rows

```json
[
  {
    "Boycott product alternatives database": "Source page",
    "Value": "https://boycott-israel.org/boycott.html"
  },
  {
    "Boycott product alternatives database": "Rows / listed items",
    "Value": 204
  },
  {
    "Boycott product alternatives database": "Alternatives per record",
    "Value": 3
  },
  {
    "Boycott product alternatives database": "Distinct alternative company names",
    "Value": 329
  },
  {
    "Boycott product alternatives database": "Categories",
    "Value": 9
  }
]
```

## Alternatives

**Rows:** 204

### Columns

- `Category`
- `Listed brand`
- `Listed sub-product / offering`
- `Impact on source page`
- `Country shown`
- `Alternative 1 company`
- `Alternative 1 product/service`
- `Alternative 1 source`
- `Alternative 2 company`
- `Alternative 2 product/service`
- `Alternative 2 source`
- `Alternative 3 company`
- `Alternative 3 product/service`
- `Alternative 3 source`
- `Notes`

### Sample rows

```json
[
  {
    "Category": "Technology and Computers",
    "Listed brand": "Apple",
    "Listed sub-product / offering": "Core computers, smartphones and tablets",
    "Impact on source page": "Low",
    "Country shown": "United States",
    "Alternative 1 company": "Lenovo",
    "Alternative 1 product/service": "ThinkPad / IdeaPad PCs",
    "Alternative 1 source": "https://www.lenovo.com/",
    "Alternative 2 company": "ASUS",
    "Alternative 2 product/service": "ExpertBook / Zenbook PCs",
    "Alternative 2 source": "https://www.asus.com/",
    "Alternative 3 company": "Acer",
    "Alternative 3 product/service": "Aspire / Swift PCs",
    "Alternative 3 source": "https://www.acer.com/",
    "Notes": "Comparable product/service; verify local availability and ownership."
  },
  {
    "Category": "Technology and Computers",
    "Listed brand": "Cisco",
    "Listed sub-product / offering": "Networking, security and collaboration platforms",
    "Impact on source page": "High",
    "Country shown": "United States",
    "Alternative 1 company": "Juniper Networks",
    "Alternative 1 product/service": "Enterprise networking",
    "Alternative 1 source": "https://www.juniper.net/",
    "Alternative 2 company": "Fortinet",
    "Alternative 2 product/service": "Network security",
    "Alternative 2 source": "https://www.fortinet.com/",
    "Alternative 3 company": "Palo Alto Networks",
    "Alternative 3 product/service": "Network and cloud security",
    "Alternative 3 source": "https://www.paloaltonetworks.com/",
    "Notes": "Comparable product/service; verify local availability and ownership."
  },
  {
    "Category": "Technology and Computers",
    "Listed brand": "Dell",
    "Listed sub-product / offering": "Personal computers and servers",
    "Impact on source page": "High",
    "Country shown": "United States",
    "Alternative 1 company": "Lenovo",
    "Alternative 1 product/service": "ThinkPad / ThinkSystem",
    "Alternative 1 source": "https://www.lenovo.com/",
    "Alternative 2 company": "ASUS",
    "Alternative 2 product/service": "ExpertBook / Pro WS",
    "Alternative 2 source": "https://www.asus.com/",
    "Alternative 3 company": "Acer",
    "Alternative 3 product/service": "TravelMate / servers",
    "Alternative 3 source": "https://www.acer.com/",
    "Notes": "Comparable product/service; verify local availability and ownership."
  },
  {
    "Category": "Technology and Computers",
    "Listed brand": "General Electric",
    "Listed sub-product / offering": "Wind turbines and maintenance",
    "Impact on source page": "Medium",
    "Country shown": "United States",
    "Alternative 1 company": "Vestas",
    "Alternative 1 product/service": "Wind turbines",
    "Alternative 1 source": "https://www.vestas.com/",
    "Alternative 2 company": "Siemens Gamesa",
    "Alternative 2 product/service": "Wind turbines and services",
    "Alternative 2 source": "https://www.siemensgamesa.com/",
    "Alternative 3 company": "Nordex",
    "Alternative 3 product/service": "Wind turbines and services",
    "Alternative 3 source": "https://www.nordex-online.com/",
    "Notes": "Comparable product/service; verify local availability and ownership."
  },
  {
    "Category": "Technology and Computers",
    "Listed brand": "Google (Alphabet)",
    "Listed sub-product / offering": "Android",
    "Impact on source page": "Medium",
    "Country shown": "United States",
    "Alternative 1 company": "Murena /e/OS",
    "Alternative 1 product/service": "/e/OS mobile OS",
    "Alternative 1 source": "https://e.foundation/e-os/",
    "Alternative 2 company": "Purism PureOS",
    "Alternative 2 product/service": "PureOS ecosystem",
    "Alternative 2 source": "https://pureos.net/",
    "Alternative 3 company": "Jolla Sailfish OS",
    "Alternative 3 product/service": "Sailfish OS",
    "Alternative 3 source": "https://sailfishos.org/",
    "Notes": "Comparable product/service; verify local availability and ownership."
  }
]
```

## Source Inventory

**Rows:** 346

### Columns

- `Field`
- `Value`

### Sample rows

```json
[
  {
    "Field": "Source page",
    "Value": "https://boycott-israel.org/boycott.html"
  },
  {
    "Field": "Scope",
    "Value": "Every listed parent company and every explicitly listed child/sub-product was included; where the source page has no child product, a comparable core offering row was created."
  },
  {
    "Field": "Important limitation",
    "Value": "This database operationalizes the supplied page. It does not independently verify the page's political, legal, or corporate-complicity claims."
  },
  {
    "Field": "Alternative rule",
    "Value": "Each row contains three alternatives from three distinct companies. Alternatives are intended as comparable products/services, not declarations that a company has no links to Israel or any particular political position."
  },
  {
    "Field": "Health warning",
    "Value": "For pharmaceuticals, alternatives are manufacturer-level options only. Never stop or change prescribed medication for boycott reasons; consult a pharmacist or clinician about active ingredient, dose, formulation, and local availability."
  }
]
```

## Methodology

**Rows:** 7

### Columns

- `Topic`
- `Method / interpretation`

### Sample rows

```json
[
  {
    "Topic": "Input",
    "Method / interpretation": "The user-provided URL was used as the inventory source. Page text was captured on 14 Aug 2026 (user timezone)."
  },
  {
    "Topic": "Inventory",
    "Method / interpretation": "Parent entries were included. Explicit child names shown under a parent were treated as sub-products or sub-brands. Entries with no child names were represented by a clearly labeled core offering."
  },
  {
    "Topic": "Alternatives",
    "Method / interpretation": "Three alternatives were selected from distinct companies and matched to the nearest practical product/service category. The same alternative company may recur across different rows when it is a category-appropriate substitute."
  },
  {
    "Topic": "Company distinction",
    "Method / interpretation": "Alternative 1, 2 and 3 companies are different from one another and are not the listed brand for that record. The database does not attempt to map every corporate parent/subsidiary relationship worldwide."
  },
  {
    "Topic": "Sources",
    "Method / interpretation": "The supplied source page is cited as the inventory source. For alternatives, official company/product landing pages are linked in the Alternatives and Source Inventory sheets. Links are starting points for verification, not endorsements."
  }
]
```
