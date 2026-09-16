# JsonToFormControl

**Parse json to Entity used for Backend
```csharp
    Entity entityJson = ParseJsonUsed(json);

    public static Entity ParseJsonUsed(string json)
    {
        var jsonObject = JObject.Parse(json);
        var entity = new Entity();

        foreach (var property in jsonObject.Properties())
        {
            var value = ParseFieldValue(property.Value);

            if (value != null)
            {
                entity[property.Name] = value;
            }
        }

        return entity;
    }

    private static object ParseFieldValue(JToken token)
    {
        if (token.Type == JTokenType.Object)
        {
            var jsonObject = (JObject)token;

            if (IsMultiLookup(jsonObject))
            {
                return ParseMultiLookup(jsonObject);
            }

            if (IsLookup(jsonObject))
            {
                return ParseLookup(jsonObject);
            }

            if (IsValueObject(jsonObject))
            {
                var value = jsonObject["value"];

                if (value == null || value.Type == JTokenType.Null)
                {
                    return null!;
                }

                if (jsonObject["label"] != null)
                {
                    return new OptionSetValue(value.Value<int>());
                }

                return ParsePrimitive(value);
            }

            return ParseObject(jsonObject);
        }

        if (token.Type == JTokenType.Array)
        {
            var result = new List<object>();

            foreach (var item in token)
            {
                result.Add(ParseFieldValue(item));
            }

            return result;
        }

        return ParsePrimitive(token);
    }

    private static Dictionary<string, object> ParseObject(JObject jsonObject)
    {
        var result = new Dictionary<string, object>();

        foreach (var property in jsonObject.Properties())
        {
            result[property.Name] = ParseFieldValue(property.Value);
        }

        return result;
    }

    private static object ParsePrimitive(JToken token)
    {
        switch (token.Type)
        {
            case JTokenType.Boolean:
                return token.Value<bool>();

            case JTokenType.Integer:
                return token.Value<long>();

            case JTokenType.Float:
                return token.Value<decimal>();

            case JTokenType.String:
                var value = token.Value<string>();

                if (string.IsNullOrWhiteSpace(value))
                {
                    return value!;
                }

                if (DateTime.TryParse(
                    value,
                    CultureInfo.InvariantCulture,
                    DateTimeStyles.None,
                    out var dateTime))
                {
                    return dateTime;
                }

                return value!;

            case JTokenType.Date:
                return token.Value<DateTime>();

            case JTokenType.Guid:
                return Guid.Parse(token.ToString());

            case JTokenType.Null:
                return null!;

            default:
                return token.ToObject<object>()!;
        }
    }

    private static bool IsValueObject(JObject jsonObject)
    {
        return jsonObject.ContainsKey("value");
    }

    private static bool IsLookup(JObject jsonObject)
    {
        return jsonObject.ContainsKey("id")
            && jsonObject.ContainsKey("entityName");
    }

    private static bool IsMultiLookup(JObject jsonObject)
    {
        return jsonObject["lookups"] is JArray;
    }

    private static EntityReference ParseLookup(JObject jsonObject)
    {
        var idValue = jsonObject["id"]?.Value<string>();
        var name = jsonObject["name"]?.Value<string>();
        var entityName = jsonObject["entityName"]?.Value<string>();

        if (!Guid.TryParse(idValue, out var id) || string.IsNullOrWhiteSpace(entityName))
        {
            throw new InvalidOperationException("Invalid lookup data.");
        }

        return new EntityReference(entityName, id)
        {
            Name = name
        };
    }

    private static List<EntityReference> ParseMultiLookup(JObject jsonObject)
    {
        var result = new List<EntityReference>();
        var lookups = jsonObject["lookups"] as JArray;

        if (lookups == null)
        {
            return result;
        }

        foreach (var lookup in lookups)
        {
            if (lookup is not JObject lookupObject)
            {
                continue;
            }

            result.Add(ParseLookup(lookupObject));
        }

        return result;
    }

```

***Set Visible,Require,Disabled Field
```javascript
setVisibleField(logicalName,bool);
setRequiredField(logicalName,bool);
setDisabledField(logicalName,bool);
```


***Json gen Form Example
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
            "required": true,
            "visible": true,
            "disabled": false
          },
          {
            "logicalName": "active",
            "displayName": "Active",
            "type": "boolean",
            "required": true,
            "visible": true,
            "disabled": false
          },
          {
            "logicalName": "address",
            "displayName": "Address",
            "type": "multiple",
            "required": false,
            "visible": true,
            "disabled": false
          },
          {
            "logicalName": "total",
            "displayName": "Total Money",
            "type": "number",
            "required": true,
            "visible": true,
            "disabled": false
          },
          {
            "logicalName": "target",
            "displayName": "Form Test",
            "type": "lookup",
            "lookupEntity": "ctt_formtest",
            "lookupSubNameAttr": "createdon",
            "required": true,
            "visible": true,
            "disabled": false
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
            "required": true,
            "visible": true,
            "disabled": false
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
            "required": true,
            "visible": true,
            "disabled": false
          },
          {
            "logicalName": "birthdate",
            "displayName": "Birthdate",
            "type": "date",
            "required": true,
            "visible": true,
            "disabled": false
          },
          {
            "logicalName": "createdon",
            "displayName": "Created On",
            "type": "datetime",
            "required": true,
            "visible": true,
            "disabled": false
          }
        ]
      }
    }
  ]
}
```


