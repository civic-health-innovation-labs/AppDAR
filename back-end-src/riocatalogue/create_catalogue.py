from pathlib import Path
import json


def create_catalogue(catalogue_path: Path,
                     number_of_rows_per_table_path: Path,
                     table_classification_path: Path,
                     primary_keys_path: Path,
                     sql_structure_path: Path) -> tuple[dict, dict]:
    """Construct a dictionary with catalogue.
    Args:
        catalogue_path (Path): Path to the catalogue.json file
        number_of_rows_per_table_path (Path): Path to the file with number of rows per table.
            The mapping has a logic tableName -> numberOfRows.
        table_classification_path (Path): To the classification of tables.
        primary_keys_path (Path): To the primary keys lists.
        sql_structure_path (Path): To the data types and constraints for each column.
    Returns:
        tuple[dict, dict]: First is a real (full) catalogue, second optimized for searching.
    """
    catalogue: dict = json.load(catalogue_path.open())
    number_of_rows_per_table: dict = json.load(number_of_rows_per_table_path.open())
    table_classification: dict = json.load(table_classification_path.open())
    primary_keys: dict = json.load(primary_keys_path.open())
    sql_structure: dict = json.load(sql_structure_path.open())
    # Catalogue optimized for searching
    search_catalogue: dict = {}

    tables_not_imported = []  # To be removed
    for _table in catalogue.keys():
        if table_classification[_table] == "not-imported":
            # Table classified as not-imported are skipped
            tables_not_imported.append(_table)
            continue
        search_strings = [_table.lower()]
        catalogue[_table]["number_of_rows"] = number_of_rows_per_table[_table]
        catalogue[_table]["table_classification"] = table_classification[_table]

        if _table in primary_keys.keys():
            catalogue[_table]["primary_keys"] = primary_keys[_table]
        else:
            catalogue[_table]["primary_keys"] = None
        # Reorganise columns
        catalogue[_table]["columns"] = {}
        for _col_name, _col_description in catalogue[_table]['columns_descriptions'].items():
            search_strings.append(_col_name.lower())
            search_strings.append(_col_description.lower())

            is_free_text = False
            if _col_name in catalogue[_table]['free_text_columns']:
                is_free_text = True
            is_identifiable = False
            if _col_name in catalogue[_table]['other_identifiable_columns']:
                is_identifiable = True
            is_client_id = False
            if _col_name in catalogue[_table]['client_id']:
                is_client_id = True
            is_date_time = False
            if _col_name in catalogue[_table]['date_time']:
                is_date_time = True
            is_date = False
            if _col_name in catalogue[_table]['date_of_birth']:
                is_date = True

            catalogue[_table]["columns"][_col_name] = {
                "description": _col_description,
                "is_free_text": is_free_text,
                "is_identifiable": is_identifiable,
                "is_client_id": is_client_id,
                "is_date_time": is_date_time,
                "is_date": is_date,
                "is_nullable": sql_structure[_table]["columns"][_col_name]["is_nullable"] == "YES",
                "data_type": sql_structure[_table]["columns"][_col_name]["data_type"],
            }
        # Drop additional keys:
        additional_keys = ["columns_descriptions", 'free_text_columns',
                           'other_identifiable_columns', 'client_id',
                           'date_time', 'date_of_birth']
        for additional_key in additional_keys:
            catalogue[_table].pop(additional_key, None)
        # Create catalogue for searching:
        search_catalogue[_table] = "|".join(search_strings)

    for _table in tables_not_imported:
        # Table classified as not-imported are skipped
        catalogue.pop(_table, None)
    return catalogue, search_catalogue
