const cheerio = require("cheerio");
const axios = require("axios");

const getData = (link) => {
  try {
    axios.get(link).then((response) => {
      $ = cheerio.load(response.data);
      let frameDataObj = {};
      //   getting table names
      const tableNames = $(".mw-headline")
        .map((i, section) => {
          const item = $(section).text();
          if (
            !["Glossary", "Sources", "Navigation", "System Data"].includes(item)
          ) {
            return item;
          }
        })
        .get();
      // ==================

      //  getting table info
      let columnNames = [];

      let tableData =
        []; /* this is an array of every tables data. Each element inside that array is another array of every moves attributes*/
      const tableHeaders = $(".cargoDynamicTable.display").map((i, section) => {
        const headers = $(section)
          .find("thead")
          .find("th")
          .map((i, th) => {
            result = $(th).text();
            if (result) {
              return result;
            }
          });
        columnNames.push(headers.get());
        let rowsData = [];
        const tableRow = $(section)
          .find("tbody")
          .children()
          .each((i, section) => {
            let row = {
              moveInfo: [],
              images: $(section)
                .attr("data-details")
                .match(/(\/wiki\/)(.*?)(?= )/gm),
            };
            $(section).each((i, childSection) => {
              $(childSection)
                .children()
                .each((j, td) => {
                  row.moveInfo.push($(td).text());
                });
            });
            rowsData.push(row);
          });
        tableData.push(rowsData);
        return headers.get();
      });

      //   making the object
      //   i is each table, j is each row in each table
      tableData.forEach((table, i) => {
        // creating a blank array for each table as an attribute inside the object
        frameDataObj[tableNames[i]] = [];
        table.forEach((row) => {
          // creating a blank object for each row of the table
          rowObject = {};
          row.moveInfo.forEach((move, j) => {
            // converting each row of the table into a key value pair, skipping the first one because its blank
            if (j > 0) {
              rowObject[columnNames[i][j - 1]] = move;
            }
          });
          //   pushing the the object to the array
          frameDataObj[tableNames[i]].push({
            ...rowObject,
            images: row.images,
          });
        });
      });
      console.log(frameDataObj);
      return frameDataObj;
      //   =======================
    });
  } catch (error) {
    console.log(error);
  }
};

getData("https://dustloop.com/w/DNFD/Hitman/Frame_Data");
