import { useEffect, useState } from "react";
import Catalogue from "../components/Catalogue";
import { BACKEND_ENDPOINT } from "../commons/backend-config";
import { getBackEndTokenObject } from "../auth/AuthenticationConfig";

/**
 * Creates details for the page with Data Catalogue
 * @returns page with data catalouge
 */
const CataloguePage = () => {
  // Contains the list of catalogue items
  const [items, setItems] = useState([]);

  // Search filter content
  const [searchString, setSearchString] = useState("");

  // Fetch catalogue items (REST)
  useEffect(() => {
    const getItems = async (searchString) => {
      const itemsFromServer = await fetchItems(searchString);
      setItems(itemsFromServer);
    };
    getItems(searchString);
  }, [searchString]);

  // Actual REST API call to fetch catalogue items
  const fetchItems = async (searchString) => {
    const res = await fetch(
      `${BACKEND_ENDPOINT}/catalogue${searchString && `?search=${searchString}`}`,
      {
        headers: {
          Authorization: `Bearer ${getBackEndTokenObject()}`,
          "Content-Type": "application/json",
        },
      }
    );
    return await res.json();
  };

  return (
    <>
      <h1>Catalogue</h1>
      <div className="newrequest-wrap">
        <div className="clear"></div>
      </div>
      <article>
        <Catalogue items={items} setSearchString={setSearchString} />
      </article>
    </>
  );
};

export default CataloguePage;
