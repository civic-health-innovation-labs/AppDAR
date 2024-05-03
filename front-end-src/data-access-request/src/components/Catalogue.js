import PropTypes from "prop-types";
import $ from "jquery";
import EmptyTable from "./EmptyTable";
import { createShortDescription, createShortTableName } from "../commons/common-scripts";

function createCheckboxID(tableName, columnPositionInTable, disabledCheckBox = false) {
  /**Create a unique identifier for the column.
   * Args:
   *  tableName: name of the table where the column belongs
   *  columnPositionInTable: relative position inside table.
   */
  return `${disabledCheckBox ? "dis-chbox" : "chbox"}-${createShortTableName(
    tableName
  )}-${columnPositionInTable}`;
}

function createCheckboxClassName(items, tableName, columnName = false, additionalClass = false) {
  /**Create a class name for the column checkbox.
   * Args:
   *  items: fetched dictionary with items.
   *  tableName: name of the table where the column is located.
   *  columnName: name of the columns inside the table or false when not applied.
   *  additionalClass: additional class that is added to string or false when not applied.
   */
  var additionalClassStr = "";
  if (additionalClass !== false) {
    additionalClassStr = " " + additionalClass;
  }
  if (columnName === false) {
    return `chboxcls-${createShortTableName(tableName)}${additionalClassStr}`;
  } else {
    // Columns classified as senstive cannot be selected
    return !items[tableName]["columns"][columnName]["is_identifiable"]
      ? `chboxcls-${createShortTableName(tableName)}${additionalClassStr}`
      : "default-class";
  }
}

function updateDictionaryOfSelectedColumns(
  tableName,
  columnName,
  selectedColumnsTables,
  setSelectedColumnsTables,
  operation = "insert",
  selectOrUnselectAll = false
) {
  /**Update the dictionary that maps selected tables and columns
   * Args:
   *    tableName: Name of the table.
   *    columnName: Name of the column.
   *    selectedColumnsTables: Dictionary with key as a table name and values as a set of
   *        columns representing selected columns inside the table.
   *    setSelectedColumnsTables: Setter method for the dictionary selectedColumnsTables.
   *    insertOperation: if "insert", values are inserted, if "delete", values are deleted
   *    selectOrUnselectAll: if true, treat the table as if all columns are selected or unselected.
   */
  let setOfCols = new Set();
  if (tableName in selectedColumnsTables) {
    // Multiple entries insert
    if (operation === "delete" && selectOrUnselectAll) {
      delete selectedColumnsTables[tableName];
      setSelectedColumnsTables(selectedColumnsTables);
    } else if (operation === "insert" && selectOrUnselectAll) {
      selectedColumnsTables[tableName] = new Set(columnName);
      setSelectedColumnsTables(selectedColumnsTables);
    } else {
      // Single entry processing
      setOfCols = selectedColumnsTables[tableName];
      if (operation === "insert") {
        setOfCols.add(columnName);
      } else if (operation === "delete") {
        setOfCols.delete(columnName);
      }
      if (setOfCols.size > 0) {
        // Insert the new value
        selectedColumnsTables[tableName] = setOfCols;
        setSelectedColumnsTables(selectedColumnsTables);
      } else {
        // Remove table if empty
        delete selectedColumnsTables[tableName];
        setSelectedColumnsTables(selectedColumnsTables);
      }
    }
  } else {
    if (operation === "delete") {
      // There is nothing to do (empty key cannot be removed)
      return;
    }
    // Multiple entries insert
    if (operation === "insert" && selectOrUnselectAll) {
      selectedColumnsTables[tableName] = new Set(columnName);
      setSelectedColumnsTables(selectedColumnsTables);
    } else {
      // Single entry problem
      setOfCols = new Set();
      setOfCols.add(columnName);
      // Insert the new value
      selectedColumnsTables[tableName] = setOfCols;
      setSelectedColumnsTables(selectedColumnsTables);
    }
  }
}

function createFullDescription(longDescription) {
  /**This method parse description (especially adds a new line characters)
   * Args:
   *  longDescription: Description in its fullness (table or column).
   */
  return longDescription.split("\n").map((item, index) => {
    return index === 0 ? item : [<br key={index} />, item];
  });
}

function createTableClassification(classificationString) {
  /**Parse table classification string.
   * Args:
   *  classificationString: Standardized table classification string
   * Returns:
   *  Full description of classification.
   */
  switch (classificationString) {
    case "data-table":
      return "Data table";
    case "code-list":
      return "Code list";
    case "not-imported":
      return "Not imported";
    case "identifiable-code-list":
      return "Code list with identifiables";
    default:
      return "n/a";
  }
}

function createColumnClass(column_def) {
  /**Parse values for the class column (with classification of columns).
   * Args:
   *  column_def: Object with definition of all column properties.
   */
  if (column_def.is_free_text) {
    return <span className="text-in-box-rubin">free&#x2011;text</span>;
  }
  if (column_def.is_identifiable) {
    return <span className="text-in-box-black">sensitive</span>;
  }
  if (column_def.is_client_id) {
    return <span className="text-in-box-navy">client&#x2011;id</span>;
  }
  if (column_def.is_date_time) {
    return <span className="text-in-box-gray">date&#x2011;time</span>;
  }
  if (column_def.is_date) {
    return <span className="text-in-box-green">date</span>;
  }
  return "n/a";
}

function createPrimaryKeys(keysList) {
  /**Parse primary keys columns list (or null value).
   * Args:
   *  keysList: array or null - contains list of primary keys.
   */
  if (keysList) {
    return keysList.join(", ");
  }
  return "n/a";
}

function showOrHideDescription(position) {
  /**This method toggle description for each table
   * Args:
   *  position: Key used for identification of  elements ID.
   */
  if ($(`#description-id-${position}`).is(":visible")) {
    $(`#description-id-${position}`).hide();
    $(`#item-id-${position}`).addClass("no-bottom-border");
    $(`#item-id-${position}`).removeClass("selected");
  } else {
    $(`#description-id-${position}`).show();
    $(`#item-id-${position}`).removeClass("no-bottom-border");
    $(`#item-id-${position}`).addClass("selected");
  }
}

const Catalogue = ({
  formSelection,
  headerText,
  subHeaderText,

  selectedColumnsTables,
  setSelectedColumnsTables,

  whereStatementPerTable,
  setWhereStatementPerTable,

  items,
  setSearchString,
}) => {
  /**Prepare data catalogue
   * Args:
   *    formSelection: boolean determining if the catalogue serves as a form.
   */

  return (
    <>
      <h2 className="no-bottom-margin">{headerText}</h2>
      {!formSelection && (
        // Search form for table is available only when column selection is off
        <div className="form-wrapper">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSearchString($("#searchid").val());
            }}
          >
            <label htmlFor="searchid">Catalogue full-text search filter</label>
            <input
              type="text"
              placeholder="Search in catalogue... (press enter to confirm)"
              id="searchid"
              onChange={(e) => {
                if (e.target.value === "") {
                  setSearchString("");
                }
              }}
            />
          </form>
        </div>
      )}

      <p>
        <em>{subHeaderText}</em>
      </p>
      {
        // If the fetched catalogue items are empty
        Object.keys(items).length === 0 && (
          <EmptyTable textForEmptyTable={"No catalogue items available."} />
        )
      }
      <div className="catalogue">
        {Object.keys(items).map((table_name, position) => (
          <div
            key={position}
            className={`item no-bottom-border${
              // Decide whether the table has any selected rows
              table_name in selectedColumnsTables ? " item-chosen" : ""
            }`}
            id={`item-id-${position}`}
          >
            <a
              href="/"
              className="head"
              onClick={(e) => {
                e.preventDefault();
                showOrHideDescription(position);
              }}
            >
              <span className="table-name">{createShortTableName(table_name)}</span>
              <span className="small-description">
                {createShortDescription(items[table_name]["table_description"])}
              </span>
              <div className="clear"></div>
            </a>
            <div
              className="description"
              id={`description-id-${position}`}
              style={{ display: "none" }}
            >
              <p>
                <strong>Description:</strong>{" "}
                {createFullDescription(items[table_name]["table_description"])}
              </p>
              <div className="table-classification">
                <p className="classification-item">
                  <strong>Number of rows:</strong> {items[table_name]["number_of_rows"]}.
                </p>
                <p className="classification-item">
                  <strong>Primary key column(s):</strong>{" "}
                  {createPrimaryKeys(items[table_name]["primary_keys"])}.
                </p>
                <p className="classification-item">
                  <strong>Table type:</strong>{" "}
                  {createTableClassification(items[table_name]["table_classification"])}.
                </p>
                <div className="clear"></div>
              </div>
              <h3 className="no-bottom-margin">Columns in the table</h3>
              <p>
                <em>
                  The following list represents columns located in the table and their parameters.
                </em>
              </p>
              <table>
                <thead>
                  <tr>
                    {formSelection && (
                      <th>
                        <input
                          type="checkbox"
                          id={`all-chbox-${createShortTableName(table_name)}`}
                          onChange={(e) => {
                            // Handles checking of all checboxes in the table
                            if (e.target.checked) {
                              $(`.${createCheckboxClassName(items, table_name)}`).prop(
                                "checked",
                                true
                              );
                              // Changes background color for table
                              $(`#item-id-${position}`).addClass("item-chosen");
                              // Update the state of selected columns
                              updateDictionaryOfSelectedColumns(
                                table_name,
                                Object.keys(items[table_name]["columns"]),
                                selectedColumnsTables,
                                setSelectedColumnsTables,
                                "insert",
                                true
                              );
                            } else {
                              $(`.${createCheckboxClassName(items, table_name)}`).prop(
                                "checked",
                                false
                              );
                              // Changes background color for table
                              $(`#item-id-${position}`).removeClass("item-chosen");
                              // Update the state of selected columns
                              updateDictionaryOfSelectedColumns(
                                table_name,
                                Object.keys(items[table_name]["columns"]),
                                selectedColumnsTables,
                                setSelectedColumnsTables,
                                "delete",
                                true
                              );
                            }
                          }}
                        />
                      </th>
                    )}
                    <th>Name</th>
                    <th>Description</th>
                    <th>Null</th>
                    <th>DType</th>
                    <th>Class</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(items[table_name]["columns"]).map((column_name, columnPosition) => (
                    <tr key={columnPosition}>
                      {formSelection && (
                        <td className="align-center">
                          <input
                            type="checkbox"
                            defaultChecked={
                              // Decide whether the column is checked based on the state
                              table_name in selectedColumnsTables
                                ? selectedColumnsTables[table_name].has(column_name)
                                : false
                            }
                            disabled={items[table_name]["columns"][column_name]["is_identifiable"]}
                            className={createCheckboxClassName(
                              items,
                              table_name,
                              column_name,
                              "chbox-column"
                            )}
                            id={
                              // Columns classified as senstive cannot be selected
                              !items[table_name]["columns"][column_name]["is_identifiable"]
                                ? createCheckboxID(table_name, columnPosition)
                                : createCheckboxID(table_name, columnPosition, true)
                            }
                            onChange={(e) => {
                              // Handles changes in table color if anything is checked
                              if (
                                // If any checkbox in the table is checked
                                $(
                                  `.${createCheckboxClassName(items, table_name)}:checkbox:checked`
                                ).length > 0
                              ) {
                                $(`#item-id-${position}`).addClass("item-chosen");
                              } else {
                                $(`#item-id-${position}`).removeClass("item-chosen");
                              }
                              // Update the set of selected columns
                              updateDictionaryOfSelectedColumns(
                                table_name,
                                column_name,
                                selectedColumnsTables,
                                setSelectedColumnsTables,
                                e.target.checked ? "insert" : "delete"
                              );
                            }}
                          />
                        </td>
                      )}
                      <td>{column_name}</td>
                      <td>
                        {createFullDescription(
                          items[table_name]["columns"][column_name]["description"]
                        )}
                      </td>
                      <td>
                        {items[table_name]["columns"][column_name]["is_nullable"] ? "Yes" : "No"}
                      </td>
                      <td>{items[table_name]["columns"][column_name]["data_type"]}</td>
                      <td>{createColumnClass(items[table_name]["columns"][column_name])}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {formSelection && (
                <div className="whereoption">
                  <label htmlFor={`where-${createShortTableName(table_name)}`}>
                    Do you wish to apply any filter?{" "}
                    <em>(Write the standard SQL WHERE statement condition here)</em>
                  </label>
                  <input
                    type="text"
                    id={`where-${createShortTableName(table_name)}`}
                    className="where-statement"
                    title={table_name}
                    defaultValue={
                      table_name in whereStatementPerTable
                        ? whereStatementPerTable[table_name]
                        : ""
                    }
                    maxLength={1024}
                    placeholder="Optional: write the WHERE statement (like: gender='M' AND recomendation='GP')."
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

// Default value
Catalogue.defaultProps = {
  formSelection: false,
  headerText: "Tables in RiO data source",
  subHeaderText: "The following list represents tables available in the RiO data source.",
  selectedColumnsTables: {},
  items: {},
};
// Type checking
Catalogue.propTypes = {
  formSelection: PropTypes.bool,
  headerText: PropTypes.string,
  subHeaderText: PropTypes.string,
};

export default Catalogue;
