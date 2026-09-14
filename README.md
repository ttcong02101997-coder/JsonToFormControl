# 🚀 Json to Form

**C# parse json to Entity
```csharp

    public static Entity JsonToEntity(string json)
    {
        using var document = JsonDocument.Parse(json);

        var entity = new Entity();

        foreach (var property in document.RootElement.EnumerateObject())
        {
            var field = property.Value;

            // Lookup
            if (field.ValueKind == JsonValueKind.Object &&
                field.TryGetProperty("id", out var idElement) &&
                field.TryGetProperty("entityName", out var entityNameElement))
            {
                var id = Guid.Parse(idElement.GetString()!);
                var entityName = entityNameElement.GetString()!;

                entity[property.Name] = new EntityReference(entityName, id);
                continue;
            }

            // Field có "value"
            if (field.ValueKind == JsonValueKind.Object &&
                field.TryGetProperty("value", out var valueElement))
            {
                // OptionSet
                if (field.TryGetProperty("label", out _))
                {
                    entity[property.Name] =
                        new OptionSetValue(valueElement.GetInt32());

                    continue;
                }

                entity[property.Name] = GetValue(valueElement);
            }
        }

        return entity;
    }

    private static object? GetValue(JsonElement value)
    {
        return value.ValueKind switch
        {
            JsonValueKind.String => value.GetString(),
            JsonValueKind.Number when value.TryGetInt32(out var intValue) => intValue,
            JsonValueKind.Number when value.TryGetInt64(out var longValue) => longValue,
            JsonValueKind.Number when value.TryGetDecimal(out var decimalValue) => decimalValue,
            JsonValueKind.True => true,
            JsonValueKind.False => false,
            JsonValueKind.Null => null,
            _ => value.ToString()
        };
    }
```

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
