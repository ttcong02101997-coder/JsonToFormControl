# 🚀 Json to Form

**Json Example

```javascript
{
  "formLogicalName": "ctt_formtest",
  "sectionBox": true,
  "sections": [
    {
      "sectionLogicalName": "general",
      "sectionLabel": "General",
      "showLabel": true,
      "sectionControls": {
        "column1": [
          {
            "logicalName": "name",
            "displayName": "Name",
            "type": "text",
            "required": true
          },
          {
            "logicalName": "active",
            "displayName": "Active",
            "type": "boolean",
            "required": true
          },
          {
            "logicalName": "address",
            "displayName": "Address",
            "type": "multiple",
            "required": false
          },
          {
            "logicalName": "total",
            "displayName": "Total Money",
            "type": "number",
            "required": true
          },
          {
            "logicalName": "target",
            "displayName": "Form Test",
            "type": "lookup",
            "lookupEntity": "ctt_formtest",
            "lookupSubNameAttr": "createdon",
            "required": true
          },
          {
            "logicalName": "detail",
            "displayName": "Form Test Detail",
            "type": "lookup",
            "lookupEntity": "ctt_formtestdetail",
            "lookupRelated": [
              {
                "byField": "target",
                "targetAttribute": "ctt_parent"
              }
            ],
            "required": true
          },
          {
            "logicalName": "status",
            "displayName": "Status",
            "type": "optionset",
            "items": [
              {
                "label": "Option 1",
                "value": 1
              },
              {
                "label": "Option 2",
                "value": 2
              },
              {
                "label": "Option 3",
                "value": 3
              }
            ],
            "required": true
          },
          {
            "logicalName": "birthdate",
            "displayName": "Birthdate",
            "type": "date",
            "required": true
          },
          {
            "logicalName": "createdon",
            "displayName": "Created On",
            "type": "datetime",
            "required": true
          }
        ]
      }
    }
  ]
}
```
