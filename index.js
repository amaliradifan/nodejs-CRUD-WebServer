const http = require("http");
const data = require("./data");

const requestListener = (req, resp) => {
	resp.setHeader("Content-Type", "application/json");

	const url = req.url;
	const method = req.method;

	//mendapatkan seluruh data
	if (url === "/bikes") {
		if (method === "GET") {
			displayData(() => {
				resp.statusCode = 200;
				const responseJSON = {
					message: "Berhasil Mendapatkan Semua Data",
					data,
				};
				resp.end(JSON.stringify(responseJSON));
			});

			//menambah data dengan method POST
		} else if (method === "POST") {
			resp.statusCode = 200;
			let body = "";
			req.on("data", (data) => {
				body += data;
			});
			req.on("end", () => {
				body = JSON.parse(body);
				const responseJSON = {
					message: "Berhasil Menambahkan Data",
					data: [...data, body],
				};
				return resp.end(JSON.stringify(responseJSON));
			});
		} else {
			resp.statusCode = 400;
			resp.end(
				JSON.stringify({
					message: `Tidak Dapat diakses dengan Metode ${method}`,
				})
			);
		}

		//request dengan endpoint /bike/:id
	} else if (url.startsWith("/bikes/")) {
		const id = parseInt(url.replace("/bikes/", ""));
		//mendapatkan data spesifik
		if (method === "GET") {
			displayData(() => {
				const dataFind = data.filter((item) => item.id === id);

				//jika data tidak ditemukan
				if (dataFind.length === 0) {
					resp.statusCode = 404;
					return resp.end(JSON.stringify({ message: "Data tidak ditemukan" }));
				}
				return resp.end(JSON.stringify(dataFind));
			});
			//mengedit data
		} else if (method === "PUT") {
			resp.statusCode = 200;
			let body = "";
			req.on("data", (data) => {
				body += data;
			});
			req.on("end", () => {
				body = JSON.parse(body);
				const index = data.findIndex((item) => item.id === id);
				const beforePut = data[index];
				//jika data tidak ditemukan
				if (index === -1) {
					resp.statusCode = 404;
					return resp.end(JSON.stringify({ message: "Data tidak ditemukan" }));
				} else {
					data[index] = body;
					const afterPut = data[index];
					const responseJson = {
						message: "Data berhasil diubah",
						from: beforePut,
						to: afterPut,
						data,
					};
					return resp.end(JSON.stringify(responseJson));
				}
			});

			//menghapus Data
		} else if (method === "DELETE") {
			resp.statusCode = 200;
			const index = data.findIndex((item) => item.id === id);
			if (index === -1) {
				resp.statusCode = 404;
				return resp.end(JSON.stringify({ message: "Data tidak ditemukan" }));
			} else {
				const deletedData = data[index];
				data.splice(index, 1);
				const responseJSON = {
					message: "Data Berhasil Dihapus",
					deletedData,
					data,
				};
				return resp.end(JSON.stringify(responseJSON));
			}
		}

		//apabila endpoint tidak ada
	} else {
		resp.statusCode = 404;
		return resp.end(
			JSON.stringify({ message: "Data Dari Request Tersebut Tidak Ditemukan" })
		);
	}

	function displayData(callback) {
		console.log("Percobaan Operasi Async..");
		setTimeout(() => {
			callback();
		}, 3000);
	}
};

const server = http.createServer(requestListener);

const port = 5000;
const host = "localhost";

server.listen(port, host, () => {
	console.log(`Server Berjalan pada http://${host}:${port}`);
});
