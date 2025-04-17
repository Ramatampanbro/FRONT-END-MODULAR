import { Card, Input, Checkbox, Button, Typography } from "@material-tailwind/react";
import { Link } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

export function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Handle the form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      setErrorMessage("Please fill in all the fields.");
      return;
    }

    const data = {
      name,
      email,
      password
    };

    try {
      // Send POST request to backend
      const response = await axios.post("http://localhost:3000/api/signup", data);
      
      if (response.status === 201) {
        console.log("User registered successfully");
        // Redirect to SignIn page after successful signup
        window.location.href = "/auth/sign-in";
      }
    } catch (error) {
      setErrorMessage("Error registering user. Please try again.");
      console.error("Signup Error:", error);
    }
  };

  return (
    <section className="m-8 flex">
      <div className="w-2/5 h-full hidden lg:block">
        <img
          src="/img/pattern.png"
          className="h-full w-full object-cover rounded-3xl"
        />
      </div>
      <div className="w-full lg:w-3/5 flex flex-col items-center justify-center">
        <div className="text-center">
          <Typography variant="h2" className="font-bold mb-4">Join Us Today</Typography>
          <Typography variant="paragraph" color="blue-gray" className="text-lg font-normal">Enter your name, email, and password to register.</Typography>
        </div>
        <form className="mt-8 mb-2 mx-auto w-80 max-w-screen-lg lg:w-1/2" onSubmit={handleSubmit}>
          <div className="mb-1 flex flex-col gap-6">
            <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
              Your name
            </Typography>
            <Input
              size="lg"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
            />
            <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
              Your email
            </Typography>
            <Input
              size="lg"
              placeholder="name@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
            />
            <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
              Password
            </Typography>
            <Input
              type="password"
              size="lg"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
            />
          </div>
          <Checkbox
            label={
              <Typography
                variant="small"
                color="gray"
                className="flex items-center justify-start font-medium"
              >
                I agree the&nbsp;
                <a
                  href="#"
                  className="font-normal text-black transition-colors hover:text-gray-900 underline"
                >
                  Terms and Conditions
                </a>
              </Typography>
            }
            checked={isChecked}
            onChange={(e) => setIsChecked(e.target.checked)}
            containerProps={{ className: "-ml-2.5" }}
          />
          <Button className="mt-6" fullWidth type="submit">
            Register Now
          </Button>

          {errorMessage && (
            <Typography variant="small" color="red" className="text-center mt-4">
              {errorMessage}
            </Typography>
          )}

          <Typography variant="paragraph" className="text-center text-blue-gray-500 font-medium mt-4">
            Already have an account?
            <Link to="/auth/sign-in" className="text-gray-900 ml-1">Sign in</Link>
          </Typography>
        </form>
      </div>
    </section>
  );
}

export default SignUp;
