async function testBackend() {

    const result = document.getElementById("result");

    result.innerText = "Connecting to backend...";

    try {

        const response = await fetch(
            "http://localhost:5000/api/test"
        );

        const data = await response.json();

        result.innerText =
            JSON.stringify(data, null, 2);

    } catch (error) {

        result.innerText =
            "Error connecting to backend:\n" +
            error.message;
    }
}


async function getUsers() {

    const result = document.getElementById("result");

    result.innerText = "Loading users...";

    try {

        const response = await fetch(
            "http://localhost:5000/api/users"
        );

        const data = await response.json();

        result.innerText =
            JSON.stringify(data, null, 2);

    } catch (error) {

        result.innerText =
            "Error:\n" +
            error.message;
    }
}
