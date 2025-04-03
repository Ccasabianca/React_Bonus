import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Container, Row, Col, Card, Spinner, Button, Form, Alert } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { addComment, removeComment } from "./redux/commentSlice";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { selectComments } from "./redux/selectors";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

const schema = yup.object({
  comment: yup
    .string()
    .required("Le commentaire est obligatoire")
    .max(500, "Max 500 caractères"),
  note: yup
    .number()
    .required("Champ requis")
    .min(1, "La note doit être un nombre entre 1 et 5")
    .max(5, "La note doit être un nombre entre 1 et 5")
    .typeError("La note doit être un nombre entre 1 et 5"),
    acceptConditions: yup
    .bool()
    .oneOf([true], "Vous devez accepter les conditions générales")
    .required("Vous devez accepter les conditions générales"),
});

function App() {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data) => {
    dispatch(
      addComment({ id: Date.now(), comment: data.comment, note: data.note })
    );
    reset();
  };

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const response = await fetch("https://jsonfakery.com/movies/random/1");
        if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);
        const data = await response.json();
        // Pour test en local, 2 fetchs sinon
        setMovie(data[0]);
      } catch (err) {
        console.error("Erreur fetch", err.message);
        setError("Impossible de charger les informations du film.");
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, []);

  if (loading)
    return <Spinner animation="border" className="d-block mx-auto mt-4" />;
  if (error)
    return (
      <Alert variant="danger" className="mt-4">
        {error}
      </Alert>
    );

  const CommentList = () => {
    const comments = useSelector(selectComments);

    return (
      <div>
        <h3>Commentaires</h3>
        {comments.length === 0 ? (
          <Alert variant="info" className="mt-4 w-100">
            Aucun commentaire pour le moment.
          </Alert>
        ) : (
          comments.map((c) => (
            <Card key={c.id} className="mb-5">
              <Card.Body className="card-body-custom">
              <Card.Text className="note-comment">Note: {c.note}/5</Card.Text>
                <Card.Text>{c.comment}</Card.Text>
                <Button
                  variant="danger"
                  className="btn-comment"
                  onClick={() => dispatch(removeComment(c.id))}
                >
                  Supprimer
                </Button>
              </Card.Body>
            </Card>
          ))
        )}
      </div>
    );
  };

  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col xs={12} md={3} />

        <Col xs={12} md={6}>
          {movie && (
            <Card className="movie-card mb-4">
              <Card.Img
                variant="top"
                className="movie-poster"
                src={movie.poster_path}
                alt={movie.original_title}
              />
              <Card.Body>
                <Card.Title>{movie.original_title}</Card.Title>
                <Card.Text>
                  Sorti le :{" "}
                  {new Date(movie.release_date).toLocaleDateString("fr-FR")}
                </Card.Text>
                <Card.Text>{movie.overview}</Card.Text>
                <Card.Text>
                  Note moyenne : {movie.vote_average} / 10 ({movie.vote_count}{" "}
                  votes)
                </Card.Text>
              </Card.Body>
            </Card>
          )}

          <Form onSubmit={handleSubmit(onSubmit)} className="mb-4">
            <h3>Commentaires</h3>
            <Form.Group className="mb-3">
              <Form.Label>Ajouter un commentaire</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                {...register("comment")}
                placeholder="Entrez votre commentaire ici"
                isInvalid={!!errors.comment}
              />
              <Form.Control.Feedback type="invalid">
                {errors.comment?.message}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Note</Form.Label>
              <Form.Control
                type="number"
                {...register("note")}
                placeholder="Entrez une note entre 1 et 5"
                isInvalid={!!errors.note}
              />
              <Form.Control.Feedback type="invalid">
                {errors.note?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="J'accepte les conditions"
                {...register("acceptConditions")}
                isInvalid={!!errors.acceptConditions}
              />
              <Form.Control.Feedback type="invalid">
                {errors.acceptConditions?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Button variant="primary" type="submit">
              Ajouter
            </Button>
          </Form>

          <CommentList />
        </Col>

        <Col xs={12} md={3} />
      </Row>
    </Container>
  );
}

export default App;
