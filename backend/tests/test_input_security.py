import pytest
from pydantic import ValidationError

from routers.public_forms import PublicFormSubmission
from schemas.storage import FileUpDownloadRequest
from services.email import escape_email_data, safe_subject


@pytest.mark.parametrize('object_key', ['../secret.txt', 'safe/../../secret.txt', '/absolute.txt', 'safe//file.txt'])
def test_storage_object_keys_reject_traversal(object_key):
    with pytest.raises(ValidationError):
        FileUpDownloadRequest(bucket_name='safe-bucket', object_key=object_key)


def test_public_form_rejects_unknown_or_missing_fields():
    with pytest.raises(ValidationError):
        PublicFormSubmission(type='contact', email='person@example.com', name='Person')

    with pytest.raises(ValidationError):
        PublicFormSubmission(
            type='lms_waitlist',
            email='person@example.com',
            unexpected='value',
        )


def test_email_html_and_subject_headers_are_sanitized():
    escaped = escape_email_data({'message': '<img src=x onerror=alert(1)>'})
    assert '<img' not in escaped['message']
    assert '&lt;img' in escaped['message']
    assert safe_subject('Hello\r\nBcc: attacker@example.com') == 'Hello  Bcc: attacker@example.com'
