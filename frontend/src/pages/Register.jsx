import { useState } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";

function Register() {

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] =
    useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    try {

      await api.post(
        "/users/register",
        {
          name,
          email,
          password
        }
      );

      alert(
        "Registration Successful"
      );

      setName("");
      setEmail("");
      setPassword("");

    } catch (error) {

      console.error(error);

      alert(
        "Registration Failed"
      );
    }
  };

  return (
    <>
      <Navbar />

      <div style={{ padding: "20px" }}>
        <h1>Register</h1>

        <form
          onSubmit={handleRegister}
        >
          <div>
            <input
              type="text"
              placeholder="Enter Name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
            />
          </div>

          <br />

          <div>
            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />
          </div>

          <br />

          <div>
            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
            />
          </div>

          <br />

          <button type="submit">
            Register
          </button>
        </form>
      </div>
    </>
  );
}

export default Register;