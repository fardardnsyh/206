export default function Intro() {
  return (
    <div className="bg-white flex flex-col justify-center items-end w-1/3">
      <div className="px-10 mr-[6%] -mt-28">
        <div className="flex">
          <h3 className="text-8xl font-extrabold text-gray-500 pt-2.5">
            Mint.
          </h3>
          <div className="bg-green-400 w-12 h-12 rounded-tl-3xl rounded-br-3xl"></div>
        </div>
        <p className="text-gray-400 text-2xl my-10 pl-1">
          A full-stack invoicing app
          <br />
          built by&nbsp;
          <a
            href="https://www.linkedin.com/in/adamwoz/"
            target="_blank"
            rel="noreferrer"
            className="text-black hover:underline underline-offset-2"
          >
            Adam Wozniak
          </a>
          .
        </p>
        <p className="text-gray-400 text-md pl-1">
          View the source code on&nbsp;
          <a
            href="https://github.com/adamwozhere/invoice-app"
            target="_blank"
            rel="noreferrer"
            className="text-black hover:underline underline-offset-2"
          >
            github
          </a>
          .
        </p>
      </div>
    </div>
  );
}
