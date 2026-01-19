module.exports = {
    login: (req, res) => {
        let data = {
            title: "login | SIMRS",
        };
        res.render("./auth/login", data);
    },
    dashboard: (req, res) => {
        let data = {
            title: "Dashboard | SIMRS",
        };

        res.render("./dashboard/index", data, (err, dashboardHtml) => {
            if (err) {
                console.error("Error rendering dashboard/index.ejs:", err);
                return res.status(500).send("Internal Server Error");
            }

            data.body = dashboardHtml;
            res.render("./layouts/main", data);
        });
    },
    menu: (req, res) => {
        let data = {
            title: "Menu Utama | SIMRS",
        };

        res.render("./menus/menu-grid", data, (err, menuGridHtml) => {
            if (err) {
                console.error("Error rendering menu-grid.ejs:", err);
                return res.status(500).send("Internal Server Error");
            }

            data.body = menuGridHtml;
            res.render("./layouts/main", data);
        });
    },
}