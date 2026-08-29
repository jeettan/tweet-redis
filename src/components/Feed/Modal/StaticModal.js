import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

function StaticModal({ show, handleClose, sharePost }) {

    return (
        <>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Share this post</Modal.Title>
                </Modal.Header>
                <Modal.Body>Are you sure you want to share this post?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={sharePost}>
                        Share
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default StaticModal;