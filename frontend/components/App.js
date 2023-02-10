import React, { useState } from "react";
import axios from "axios";
import { NavLink, Routes, Route, useNavigate } from "react-router-dom";
import Articles from "./Articles";
import LoginForm from "./LoginForm";
import Message from "./Message";
import ArticleForm from "./ArticleForm";
import Spinner from "./Spinner";
import { axiosWithAuth } from "../axios";

const articlesUrl = "http://localhost:9000/api/articles";
const logon = "http://localhost:9000/api/login";

export default function App() {
  const [message, setMessage] = useState("");
  const [articles, setArticles] = useState([]);
  const [currentArticleId, setCurrentArticleId] = useState(null);
  const [spinnerOn, setSpinnerOn] = useState(false);

  const navigate = useNavigate();
  const redirectToLogin = () => {
    navigate("/");
  };
  const redirectToArticles = () => {
    navigate("/articles");
  };

  const logout = () => {
    const token = localStorage.getItem("token");
    localStorage.removeItem("token", token);

    if (!token) {
      navigate("/");
    } else {
      setMessage("Goodbye!");
      redirectToLogin();
    }
  };

  const login = (username, password) => {
    const userCreds = {
      username: username,
      password: password,
    };
    setMessage("");
    setSpinnerOn(true);
    axios
      .post(logon, userCreds)
      .then((res) => {
        const token = res.data.token;
        localStorage.setItem("token", token);
        setMessage(res.data.message);
        redirectToArticles();
        setSpinnerOn(false);
      })
      .catch((err) => {
        console.error(err);
        setMessage("");
        setSpinnerOn(false);
      });
  };

  const getArticles = () => {
    setMessage("");
    setSpinnerOn(true);
    axiosWithAuth()
      .get(articlesUrl)
      .then((res) => {
        setArticles(res.data.articles);
        setMessage(res.data.message);
        setSpinnerOn(false);
      })
      .catch((err) => {
        setMessage(err.config.message);
        setSpinnerOn(false);
      });
  };

  const postArticle = (article) => {
    setMessage("");
    setSpinnerOn(true);
    axiosWithAuth()
      .post(articlesUrl, article)
      .then((res) => {
        setArticles([...articles, res.data.article]);
        setMessage(res.data.message);
        setSpinnerOn(false);
      })
      .catch((err) => {
        setMessage(err.config.message);
        setSpinnerOn(false);
      });
  };

  const updateArticle = (article) => {
    const { article_id, ...changes } = article;

    setMessage("");
    setSpinnerOn(true);
    axiosWithAuth()
      .put(`${articlesUrl}/${article_id}`, changes)
      .then((res) => {
        setArticles(
          articles.map((art) => {
            return art.article_id === article_id ? res.data.article : art;
          })
        );
        setMessage(res.data.message);
        setSpinnerOn(false);
        setCurrentArticleId(null);
      })
      .catch((err) => {
        console.error(err);
        setMessage("");
        setSpinnerOn(false);
      });
  };

  const deleteArticle = (article_id) => {
    setMessage("");
    setSpinnerOn(true);
    axiosWithAuth()
      .delete(`${articlesUrl}/${article_id}`)
      .then((res) => {
        setSpinnerOn(false);
        setMessage(res.data.message);
        setArticles(
          articles.filter((art) => {
            return art.article_id !== article_id;
          })
        );
      })
      .catch((err) => {
        console.error(err);
        setMessage("");
        setSpinnerOn(false);
      });
  };

  return (
    <React.StrictMode>
      <Spinner on={spinnerOn} />
      <Message message={message} />
      <button
        id="logout"
        onClick={() => {
          logout();
        }}
      >
        Logout from app
      </button>
      <div id="wrapper" style={{ opacity: spinnerOn ? "0.25" : "1" }}>
        {" "}
        {/* <-- do not change this line */}
        <h1>Advanced Web Applications</h1>
        <nav>
          <NavLink id="loginScreen" to="/">
            Login
          </NavLink>
          <NavLink id="articlesScreen" to="/articles">
            Articles
          </NavLink>
        </nav>
        <Routes>
          <Route path="/" element={<LoginForm login={login} />} />
          <Route
            path="articles"
            element={
              <>
                <ArticleForm
                  postArticle={postArticle}
                  updateArticle={updateArticle}
                  setCurrentArticleId={setCurrentArticleId}
                  currentArticle={articles.find(
                    (art) => art.article_id === currentArticleId
                  )}
                  number={currentArticleId}
                />
                <Articles
                  articles={articles}
                  getArticles={getArticles}
                  deleteArticle={deleteArticle}
                  setCurrentArticleId={setCurrentArticleId}
                  currentArticle={currentArticleId}
                />
              </>
            }
          />
        </Routes>
        <footer>Bloom Institute of Technology 2022</footer>
      </div>
    </React.StrictMode>
  );
}
