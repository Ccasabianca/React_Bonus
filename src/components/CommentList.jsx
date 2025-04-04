import { useDispatch, useSelector } from "react-redux";
import { Card, Button, Alert } from "react-bootstrap";
import { removeComment } from "../redux/commentSlice";

const CommentList = () => {
  const comments = useSelector((state) => state.comments);
  const dispatch = useDispatch();

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

export default CommentList;
