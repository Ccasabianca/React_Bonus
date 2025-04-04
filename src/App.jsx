import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Container, Row, Col, Card, Spinner, Button, Form, Alert} from "react-bootstrap";
import { useForm } from "react-hook-form";
import { addComment } from "./redux/commentSlice";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import CommentList from "./components/CommentList";

const schema = yup.object({
  comment: yup
    .string()
    .required("Le commentaire est obligatoire")
    .max(500, "Max 500 caractères"),
  note: yup
    .number()
    .required("Champ requis")
    .min(1)
    .max(5)
    .typeError("La note doit être un nombre entre 1 et 5"),
  acceptConditions: yup
    .bool()
    .oneOf([true], "Vous devez accepter les conditions générales"),
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
    defaultValues: {
      acceptConditions: false,
    },
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

  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
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
                <Card.Text className="date-sortie">
                  Sorti le :{" "}
                  {new Date(movie.release_date).toLocaleDateString("fr-FR")}
                </Card.Text>
                <Card.Text>{movie.overview}</Card.Text>
                <Card.Text>
                  Note moyenne : {movie.vote_average} ({movie.vote_count} votes)
                </Card.Text>
              </Card.Body>
            </Card>
          )}

          <Form onSubmit={handleSubmit(onSubmit)} className="mb-4">
            <h3>Ajouter un commentaire</h3>

            <Form.Group controlId="comment" className="mb-3">
              <Form.Label>Commentaire</Form.Label>
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

            <Form.Group controlId="note" className="mb-3">
              <Form.Label>Note</Form.Label>
              <Form.Select {...register("note")} isInvalid={!!errors.note}>
                <option value="">Sélectionnez une note</option>
                {[1, 2, 3, 4, 5].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors.note?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId="acceptConditions" className="mb-3">
              <Form.Check
                type="checkbox"
                label="J'accepte les conditions générales"
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
      </Row>
    </Container>
  );
}

export default App;
